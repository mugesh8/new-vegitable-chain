import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download } from 'lucide-react';
import { getAllOrders } from '../../../api/orderApi';
import { getOrderAssignment } from '../../../api/orderAssignmentApi';
import { getAllLabours } from '../../../api/labourApi';
import { getAllLabourRates } from '../../../api/labourRateApi';
import { getAllLabourExcessPay } from '../../../api/labourExcessPayApi';

const LabourPayoutManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('labour');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);

  const formatCurrency = (amount) => {
    const value = Number.isFinite(amount) ? amount : 0;
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const cleanForMatching = (name) => {
    if (!name) return '';
    return name.replace(/^\d+\s*-\s*/, '').trim();
  };

  useEffect(() => {
    fetchLabourPayouts();
  }, []);

  const fetchLabourPayouts = async () => {
    try {
      setLoading(true);

      const [ordersRes, laboursRes, labourRatesRes, excessPayRes] = await Promise.all([
        getAllOrders(),
        getAllLabours(1, 1000),
        getAllLabourRates().catch(() => []),
        getAllLabourExcessPay().catch(() => ({ data: [] }))
      ]);

      const orders = ordersRes?.data || [];
      const labours = laboursRes?.data || laboursRes?.labours || [];
      const labourRates = Array.isArray(labourRatesRes) ? labourRatesRes : (labourRatesRes?.data || []);
      const excessPays = excessPayRes?.data || [];

      const labourMap = new Map(
        labours.map(l => [String(l.lid), l])
      );

      const ratesMap = {};
      labourRates.forEach(rate => {
        if (rate.status === 'Active') {
          ratesMap[rate.labourType] = parseFloat(rate.amount) || 0;
        }
      });

      const excessPayMap = {};
      excessPays.forEach(pay => {
        excessPayMap[String(pay.labour_id)] = parseFloat(pay.amount) || 0;
      });

      // Aggregate wages per labour from Stage 2 summary (labourPrices)
      const wagesByLabourId = {};

      const assignmentPromises = orders.map(async (order) => {
        try {
          const assignmentRes = await getOrderAssignment(order.oid).catch(() => null);
          if (!assignmentRes?.data?.stage2_summary_data) return;

          let summary;
          try {
            summary = typeof assignmentRes.data.stage2_summary_data === 'string'
              ? JSON.parse(assignmentRes.data.stage2_summary_data)
              : assignmentRes.data.stage2_summary_data;
          } catch {
            return;
          }

          const labourPrices = summary.labourPrices || [];
          labourPrices.forEach(lp => {
            const labourId = lp.labourId;
            const labourName = lp.labourName || lp.labour;
            if (!labourId && !labourName) return;

            const idKey = labourId ? String(labourId) : null;
            const wage =
              parseFloat(lp.totalAmount ?? lp.labourWage ?? 0) || 0;

            if (!wage) return;

            const key = idKey || labourName;
            if (!wagesByLabourId[key]) {
              wagesByLabourId[key] = 0;
            }
            wagesByLabourId[key] += wage;
          });
        } catch (error) {
          console.error(`Error processing order ${order.oid} for labour payouts:`, error);
        }
      });

      await Promise.all(assignmentPromises);

      // Build final payout rows
      const processedPayouts = Object.entries(wagesByLabourId).map(([key, totalWage]) => {
        // Try to resolve by labourId first
        let labour = labourMap.get(key);
        if (!labour) {
          // Fallback: match by name
          const normalizedName = key.toLowerCase();
          labour = labours.find(l =>
            (l.full_name || l.name || '').trim().toLowerCase() === normalizedName
          );
        }

        const labourId = labour ? String(labour.lid) : key;
        const workType = labour?.work_type || 'Normal';
        const rate =
          ratesMap[workType] ||
          parseFloat(labour?.daily_wage) ||
          0;

        const daysWorked = rate > 0 ? totalWage / rate : 0;
        const roundedDays = Math.round(daysWorked);

        const excessPay = excessPayMap[labourId] || 0;

        return {
          id: labourId,
          labourName: labour?.full_name || labour?.name || key,
          labourCode: labour?.labour_id || `LID-${labourId}`,
          daysWorked: roundedDays,
          wageRate: rate,
          excessPay: excessPay,
          netAmount: totalWage + excessPay, // Net Amount = Excess Pay + Net Amount (totalWage)
          status: 'Unpaid' // Default status is Unpaid
        };
      });

      // Sort by highest net amount
      processedPayouts.sort((a, b) => b.netAmount - a.netAmount);

      setPayouts(processedPayouts);
    } catch (error) {
      console.error('Error fetching labour payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayouts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return payouts;
    return payouts.filter(p =>
      p.labourName.toLowerCase().includes(query) ||
      p.labourCode.toLowerCase().includes(query)
    );
  }, [payouts, searchQuery]);

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayouts = filteredPayouts.slice(startIndex, startIndex + itemsPerPage);

  const summaryStats = useMemo(() => {
    const totalPayouts = payouts.length;
    const totalAmount = payouts.reduce((sum, p) => sum + p.netAmount, 0);
    const averageDailyWage =
      payouts.length > 0
        ? payouts.reduce((sum, p) => sum + p.wageRate, 0) / payouts.length
        : 0;

    // Here we just treat all as "this month" for now; can be extended with date filters
    const paidThisMonth = totalAmount;

    const activeLabour = payouts.length;

    return {
      totalPayouts,
      averageDailyWage,
      paidThisMonth,
      activeLabour
    };
  }, [payouts]);

  const stats = [
    { label: 'Total Payouts', value: summaryStats.totalPayouts.toString(), change: '' },
    { label: 'Average Daily Wage', value: formatCurrency(summaryStats.averageDailyWage), change: '' },
    { label: 'Total Wages (This Period)', value: formatCurrency(summaryStats.paidThisMonth), change: '' },
    { label: 'Total Active Labour', value: summaryStats.activeLabour.toString(), change: '' }
  ];

  const handlePayClick = (payoutId) => {
    setPayouts(prevPayouts => 
      prevPayouts.map(payout => 
        payout.id === payoutId 
          ? { ...payout, status: 'Paid' }
          : payout
      )
    );
  };

  const getStatusColor = (status) => {
    if (status === 'Paid') {
      return 'bg-emerald-100 text-emerald-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  };

  const getActionButton = (status) => {
    if (status === 'Unpaid') {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    }
    return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => navigate('/payouts')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Farmer Payout
          </button>
          <button
            onClick={() => navigate('/payout-supplier')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Supplier Payout
          </button>
          <button
            onClick={() => navigate('/payout-thirdparty')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Third Party Payout
          </button>
          <button
            onClick={() => setActiveTab('labour')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-[#0D7C66] text-white shadow-md"
          >
            Labour Payout
          </button>
          <button
            onClick={() => navigate('/payout-driver')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Driver Payout
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`${
                index === 0 ? 'bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0]' :
                index === 1 ? 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399]' :
                index === 2 ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' :
                'bg-gradient-to-r from-[#047857] to-[#065F46]'
              } rounded-2xl p-6 ${
                index === 2 || index === 3 ? 'text-white' : 'text-[#0D5C4D]'
              }`}
            >
              <div className="text-sm font-medium mb-2 opacity-90">{stat.label}</div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                index === 2 || index === 3 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/60 text-[#0D5C4D]'
              }`}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D0E0DB] p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, farmer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-gray-50"
              />
            </div>

            {/* Filter Button */}
            <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 hover:bg-gray-50 text-gray-700 text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {/* Export Button */}
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Labour Payouts Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D4F4E8]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Labour Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Days Worked
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Wage Rate
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Excess Pay
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Net Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-[#6B8782]">
                      Loading labour payouts...
                    </td>
                  </tr>
                ) : paginatedPayouts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-[#6B8782]">
                      No labour payouts found
                    </td>
                  </tr>
                ) : (
                  paginatedPayouts.map((payout, index) => (
                    <tr
                      key={payout.id}
                      className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#0D5C4D] text-sm">{payout.labourName}</div>
                        <div className="text-xs text-[#6B8782]">{payout.labourCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#0D5C4D]">
                          {payout.daysWorked} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#0D5C4D]">
                          {formatCurrency(payout.wageRate)}/day
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#0D5C4D]">
                          {formatCurrency(payout.excessPay)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#0D5C4D]">
                          {formatCurrency(payout.netAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                            payout.status
                          )}`}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handlePayClick(payout.id)}
                          className={`px-6 py-2 rounded-lg text-xs font-semibold transition-colors ${getActionButton(
                            payout.status
                          )}`}
                        >
                          {payout.status === 'Paid' ? 'View' : 'Pay'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>



          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
            <div className="text-sm text-[#6B8782]">
              Showing {filteredPayouts.length === 0 ? 0 : startIndex + 1} to{' '}
              {Math.min(startIndex + itemsPerPage, filteredPayouts.length)} of {filteredPayouts.length} Labour
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#6B8782] hover:bg-[#D0E0DB]'
                }`}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#0D8568] text-white'
                        : 'text-[#6B8782] hover:bg-[#D0E0DB]'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#6B8782] hover:bg-[#D0E0DB]'
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default LabourPayoutManagement;