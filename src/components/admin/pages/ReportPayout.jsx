import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Download, Calendar } from 'lucide-react';
import { getAllOrders } from '../../../api/orderApi';
import { getOrderAssignment } from '../../../api/orderAssignmentApi';
import { getAllFarmers } from '../../../api/farmerApi';
import { getAllSuppliers } from '../../../api/supplierApi';
import { getAllThirdParties } from '../../../api/thirdPartyApi';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileText, FileSpreadsheet } from 'lucide-react';

const ReportPayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allPayouts, setAllPayouts] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'farmer', 'supplier', 'thirdParty'
    status: 'all', // 'all', 'paid', 'unpaid'
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [ordersRes, farmersRes, suppliersRes, thirdPartiesRes] = await Promise.all([
        getAllOrders(),
        getAllFarmers(),
        getAllSuppliers(),
        getAllThirdParties()
      ]);

      const orders = ordersRes?.data || [];
      const farmers = farmersRes?.data || [];
      const suppliers = suppliersRes?.data || [];
      const thirdParties = thirdPartiesRes?.data || [];

      // Helper to lookup names
      const getEntityName = (type, id) => {
        if (type === 'farmer') return farmers.find(f => f.fid == id)?.farmer_name || 'Unknown Farmer';
        if (type === 'supplier') return suppliers.find(s => s.sid == id)?.supplier_name || 'Unknown Supplier';
        if (type === 'thirdParty') return thirdParties.find(t => t.tpid == id)?.third_party_name || 'Unknown Third Party';
        return 'Unknown';
      };

      const cleanForMatching = (name) => {
        if (!name) return '';
        return name.replace(/^\d+\s*-\s*/, '').trim();
      };

      // Process all orders to build payout records
      const processedPayouts = [];

      // Fetch assignments for all orders
      // Note: In a large system, we might want to paginate this or fetch on demand.
      // For now, we process all to get accurate totals.
      const assignmentPromises = orders.map(async (order) => {
        try {
          const assignmentRes = await getOrderAssignment(order.oid).catch(() => null);
          if (!assignmentRes?.data?.product_assignments) return;

          let assignments = [];
          try {
            assignments = typeof assignmentRes.data.product_assignments === 'string'
              ? JSON.parse(assignmentRes.data.product_assignments)
              : assignmentRes.data.product_assignments;
          } catch (e) {
            return;
          }

          // Get Stage 4 data for pricing
          let stage4ProductRows = [];
          try {
            if (assignmentRes.data?.stage4_data) {
              const stage4Data = typeof assignmentRes.data.stage4_data === 'string'
                ? JSON.parse(assignmentRes.data.stage4_data)
                : assignmentRes.data.stage4_data;
              if (stage4Data?.reviewData?.productRows) {
                stage4ProductRows = stage4Data.reviewData.productRows;
              }
            }
          } catch (e) {
            console.error('Error parsing stage4_data:', e);
          }

          // Group by entity
          const entityGroups = {};
          assignments.forEach(assignment => {
            // Skip if no entity type or id (shouldn't happen for valid assignments)
            if (!assignment.entityType || !assignment.entityId) return;

            // Normalize entity type names to match our filter keys
            let type = assignment.entityType;
            if (type === 'thirdParty') type = 'thirdParty'; // keep as is

            const key = `${type}_${assignment.entityId}`;
            if (!entityGroups[key]) {
              entityGroups[key] = {
                type: type,
                id: assignment.entityId,
                assignments: []
              };
            }
            entityGroups[key].assignments.push(assignment);
          });

          // Calculate totals for each entity in this order
          Object.values(entityGroups).forEach(group => {

            const enrichedAssignments = group.assignments.map(assignment => {
              const cleanAssignmentProduct = cleanForMatching(assignment.product);

              // Get quantity
              let qty = parseFloat(assignment.assignedQty) || 0;
              if (!qty) {
                const matchingItem = order.items?.find(item => {
                  const itemProduct = item.product_name || item.product || '';
                  return cleanForMatching(itemProduct) === cleanAssignmentProduct;
                });
                if (matchingItem) {
                  qty = parseFloat(matchingItem.net_weight) || parseFloat(matchingItem.quantity) || 0;
                }
              }

              // Get price
              let price = parseFloat(assignment.price) || 0;
              if (!price) {
                const stage4Entry = stage4ProductRows.find(s4 => {
                  const s4Product = cleanForMatching(s4.product || s4.product_name || '');
                  const s4AssignedTo = s4.assignedTo || s4.assigned_to || '';
                  return s4Product === cleanAssignmentProduct && (s4AssignedTo === assignment.assignedTo || !assignment.assignedTo);
                });
                if (stage4Entry) {
                  price = parseFloat(stage4Entry.price) || 0;
                }
              }

              return { ...assignment, assignedQty: qty, price: price };
            });

            const totalAmount = enrichedAssignments.reduce((sum, a) => sum + (a.assignedQty * a.price), 0);

            if (totalAmount > 0) {
              processedPayouts.push({
                id: `${order.oid}_${group.type}_${group.id}`,
                orderId: order.oid,
                orderDate: order.order_received_date || order.createdAt,
                entityId: group.id,
                entityType: group.type,
                recipient: getEntityName(group.type, group.id),
                amount: totalAmount,
                status: (order.payment_status === 'paid' || order.payment_status === 'completed') ? 'Paid' : 'Unpaid'
              });
            }
          });

        } catch (error) {
          console.error(`Error processing order ${order.oid}:`, error);
        }
      });

      await Promise.all(assignmentPromises);

      // Sort by date newest first
      processedPayouts.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

      setAllPayouts(processedPayouts);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayouts = useMemo(() => {
    return allPayouts.filter(payout => {
      // Type Filter
      if (filters.type !== 'all' && payout.entityType !== filters.type) return false;

      // Status Filter
      if (filters.status !== 'all') {
        if (filters.status === 'paid' && payout.status !== 'Paid') return false;
        if (filters.status === 'unpaid' && payout.status !== 'Unpaid') return false;
      }

      // Date Filter
      if (filters.dateFrom) {
        const payoutDate = new Date(payout.orderDate);
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (payoutDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const payoutDate = new Date(payout.orderDate);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (payoutDate > toDate) return false;
      }

      return true;
    });
  }, [allPayouts, filters]);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = filteredPayouts.reduce((sum, p) => sum + p.amount, 0);
    const paid = filteredPayouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = filteredPayouts.filter(p => p.status === 'Unpaid').reduce((sum, p) => sum + p.amount, 0);

    return [
      { label: 'Total Payouts', value: filteredPayouts.length.toString(), sub: 'Transactions', color: 'bg-gradient-to-r from-[#10B981] to-[#059669]' },
      { label: 'Total Amount', value: `₹${(total / 1000).toFixed(1)}K`, sub: 'Value', color: 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB]' },
      { label: 'Paid Amount', value: `₹${(paid / 1000).toFixed(1)}K`, sub: `${((paid / total || 0) * 100).toFixed(0)}%`, color: 'bg-gradient-to-r from-[#4ED39A] to-[#34D399]' },
      { label: 'Pending Amount', value: `₹${(pending / 1000).toFixed(1)}K`, sub: `${((pending / total || 0) * 100).toFixed(0)}%`, color: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]' }
    ];
  }, [filteredPayouts]);

  // Pagination
  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
  const paginatedPayouts = filteredPayouts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = filteredPayouts.map(p => ({
      'Payout ID': p.id,
      'Order ID': p.orderId,
      'Recipient': p.recipient,
      'Type': p.entityType.charAt(0).toUpperCase() + p.entityType.slice(1),
      'Amount': p.amount,
      'Date': new Date(p.orderDate).toLocaleDateString('en-GB'),
      'Status': p.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Payouts");
    XLSX.writeFile(wb, `Payouts_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Attractive Header
    doc.setFillColor(13, 92, 77);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('PAYOUT REPORT', 105, 20, { align: 'center' });

    // Subheader with Filter Details
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    let filterText = `Generated on: ${new Date().toLocaleDateString('en-GB')}`;
    if (filters.type !== 'all') filterText += ` | Type: ${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}`;
    if (filters.status !== 'all') filterText += ` | Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`;
    doc.text(filterText, 105, 30, { align: 'center' });

    // Table Data
    const tableBody = filteredPayouts.map(p => [
      p.orderId,
      p.recipient,
      p.entityType.charAt(0).toUpperCase() + p.entityType.slice(1),
      `Rs. ${p.amount.toFixed(2)}`,
      new Date(p.orderDate).toLocaleDateString('en-GB'),
      p.status
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Order ID', 'Recipient', 'Type', 'Amount', 'Date', 'Status']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [13, 92, 77], textColor: 255, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 9, halign: 'center' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'left' },
        3: { halign: 'right' }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Summary Section
    doc.setFillColor(236, 253, 245);
    doc.rect(14, finalY, 182, 25, 'F');

    const totalAmount = filteredPayouts.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = filteredPayouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = filteredPayouts.filter(p => p.status === 'Unpaid').reduce((sum, p) => sum + p.amount, 0);

    doc.setTextColor(13, 92, 77);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Payouts: ${filteredPayouts.length}`, 20, finalY + 8);
    doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, 20, finalY + 16);

    doc.text(`Paid: Rs. ${paidAmount.toFixed(2)}`, 100, finalY + 8);
    doc.text(`Pending: Rs. ${pendingAmount.toFixed(2)}`, 100, finalY + 16);

    doc.save(`Payout_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#0D8568] text-xl animate-pulse">Loading payout details...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#E6F7F4] to-[#D0E9E4] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <button onClick={() => navigate('/reports')} className="flex items-center gap-2 text-[#0D5C4D] hover:text-[#0a6354] transition-colors w-fit">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Reports</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors"
          >
            <FileText size={18} />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[#0D5C4D] mb-6">Payout Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform`}>
            <div className="text-sm font-medium mb-2 opacity-90">{stat.label}</div>
            <div className="text-4xl font-bold mb-2">{stat.value}</div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-[#6B8782] mb-1">Entity Type</label>
            <select
              value={filters.type}
              onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568]"
            >
              <option value="all">All Entities</option>
              <option value="farmer">Farmer</option>
              <option value="supplier">Supplier</option>
              <option value="thirdParty">Third Party</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-[#6B8782] mb-1">Payment Status</label>
            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568]"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-[#6B8782] mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => { setFilters({ ...filters, dateFrom: e.target.value }); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568]"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-[#6B8782] mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => { setFilters({ ...filters, dateTo: e.target.value }); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568]"
            />
          </div>
          <button
            onClick={() => setFilters({ type: 'all', status: 'all', dateFrom: '', dateTo: '' })}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors h-[42px]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB] shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D8568] text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Recipient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayouts.length > 0 ? (
                paginatedPayouts.map((payout, index) => (
                  <tr key={index} className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}>
                    <td className="px-6 py-4 text-sm text-[#0D5C4D] font-medium">{payout.orderId}</td>
                    <td className="px-6 py-4 font-semibold text-[#0D5C4D]">{payout.recipient}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                                ${payout.entityType === 'farmer' ? 'bg-[#D1FAE5] text-[#065F46]' :
                          payout.entityType === 'supplier' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                            'bg-[#FEF3C7] text-[#92400E]'}`}>
                        {payout.entityType.charAt(0).toUpperCase() + payout.entityType.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#0D5C4D]">₹{payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-[#0D5C4D]">{new Date(payout.orderDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit 
                                                ${payout.status === 'Paid' ? 'bg-[#4ED39A] text-white' : 'bg-red-500 text-white'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[#6B8782]">
                    No payouts found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB] gap-4">
          <div className="text-sm text-[#6B8782]">
            Showing {paginatedPayouts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredPayouts.length)} of {filteredPayouts.length} payouts
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg transition-colors ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#0D5C4D] hover:bg-[#D0E0DB]'}`}
            >
              &lt;
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Simple logic to show a window of pages or just first 5 for now
              // Improved logic: show current page window
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                }
                if (pageNum > totalPages) return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium ${currentPage === pageNum ? 'bg-[#0D8568] text-white' : 'text-[#6B8782] hover:bg-[#D0E0DB]'}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-2 rounded-lg transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#0D5C4D] hover:bg-[#D0E0DB]'}`}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPayout;
