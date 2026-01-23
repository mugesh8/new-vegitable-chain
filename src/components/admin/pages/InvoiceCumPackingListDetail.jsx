import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { getAllOrders } from '../../../api/orderApi';
import { getOrderAssignment } from '../../../api/orderAssignmentApi';

const InvoiceCumPackingListDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const ordersResponse = await getAllOrders();
      
      if (ordersResponse?.data) {
        const foundOrder = ordersResponse.data.find(o => o.oid === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
          
          // Fetch assignment data
          try {
            const assignmentResponse = await getOrderAssignment(foundOrder.oid);
            
            // Parse stage4 data
            if (assignmentResponse.data?.stage4_data) {
              const s4 = typeof assignmentResponse.data.stage4_data === 'string'
                ? JSON.parse(assignmentResponse.data.stage4_data)
                : assignmentResponse.data.stage4_data;
              
              // Process invoice items from stage4
              processInvoiceItems(foundOrder, s4);
            }
          } catch (err) {
            console.error('Error fetching assignment:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const processInvoiceItems = (order, s4Data) => {
    const cleanForMatching = (name) => {
      if (!name) return '';
      return name.replace(/^\d+\s*-\s*/, '').trim();
    };

    const stage4ProductRows = s4Data?.reviewData?.productRows || [];

    // Process each order item individually
    const processedItems = [];
    let markStart = 1;
    
    order.items?.forEach((item) => {
      const productName = item.product_name || item.product || '';
      const cleanProduct = cleanForMatching(productName);
      
      const parseNumBoxes = (numBoxesStr) => {
        if (!numBoxesStr) return 0;
        if (typeof numBoxesStr === 'number') return numBoxesStr;
        const match = String(numBoxesStr).match(/^(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
      };

      const numBoxes = parseNumBoxes(item.num_boxes);
      const netWeight = parseFloat(item.net_weight) || 0;
      const packingType = item.packing_type || 'CTN';
      
      // Get price from stage4
      const stage4Entry = stage4ProductRows.find(s4 => {
        const s4Product = cleanForMatching(s4.product || s4.product_name || '');
        return s4Product === cleanProduct;
      });

      const price = stage4Entry ? parseFloat(stage4Entry.price) || 0 : 0;
      const totalAmount = netWeight * price;
      const markEnd = markStart + Math.round(numBoxes) - 1;

      if (numBoxes > 0 && netWeight > 0) {
        processedItems.push({
          markNos: markStart === markEnd ? `${markStart}` : `${markStart}-${markEnd}`,
          kindOfPkgs: packingType === 'BAG' ? 'BAG' : 'CTN',
          noOfPkgs: Math.round(numBoxes),
          description: productName,
          quantityWeight: netWeight.toFixed(0),
          ratePerKg: price > 0 ? price.toFixed(2) : '1.30',
          totalAmount: totalAmount > 0 ? totalAmount.toFixed(2) : (netWeight * 1.3).toFixed(2)
        });

        markStart = markEnd + 1;
      }
    });

    setInvoiceItems(processedItems);
  };

  const numberToWords = (num) => {
    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
      'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

    if (num === 0) return 'ZERO';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' HUNDRED' + (num % 100 !== 0 ? ' AND ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' THOUSAND' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
    return 'LARGE NUMBER';
  };

  const formatAmountInWords = (amount) => {
    const parts = amount.toString().split('.');
    const wholePart = parseInt(parts[0]);
    const decimalPart = parts[1] ? parseInt(parts[1]) : 0;
    
    let words = numberToWords(wholePart);
    if (decimalPart > 0) {
      // Handle decimal part - convert to cents
      const cents = decimalPart < 10 ? decimalPart * 10 : decimalPart;
      if (cents < 100) {
        words += ' AND ' + numberToWords(cents) + ' CENT';
      } else {
        words += ' AND ' + numberToWords(Math.floor(cents / 10)) + ' CENT';
      }
    }
    return words + ' ONLY';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-xl">Loading invoice details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-xl text-gray-500">Order not found</div>
      </div>
    );
  }

  const totalNetWeight = invoiceItems.reduce((sum, item) => sum + parseFloat(item.quantityWeight), 0);
  const totalGrossWeight = order.items?.reduce((sum, item) => sum + (parseFloat(item.gross_weight) || 0), 0) || 0;
  const totalAmount = invoiceItems.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);
  const totalBoxes = invoiceItems.reduce((sum, item) => sum + parseInt(item.noOfPkgs), 0);

  const invoiceDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')
    : new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
  const invoiceNo = `MAA/CHO/${order.oid || 'N/A'}`;

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/reports/invoice-cum-packing-list')} 
          className="flex items-center gap-2 text-[#0D5C4D] hover:text-[#0a6354]"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Report</span>
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#0D8568] text-white rounded-lg hover:bg-[#0a6354] flex items-center gap-2">
            <Printer size={18} />
            Print
          </button>
          <button className="px-4 py-2 bg-[#0D8568] text-white rounded-lg hover:bg-[#0a6354] flex items-center gap-2">
            <Download size={18} />
            Download
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white border-2 border-gray-300 p-8 max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE CUM PACKING LIST</h1>
        </div>

        {/* Invoice Header Section */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Exporter Section */}
          <div className="col-span-5 border border-gray-400 p-3">
            <div className="font-semibold text-sm mb-2">Expoter</div>
            <div className="text-sm min-h-[100px]">
              <div className="font-semibold">GREEN VISION TRADERS</div>
              <div className="mt-2">[Address will be filled]</div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="col-span-7 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold mb-1">Invoice Date</div>
              <div className="border-b border-gray-400 pb-1 text-sm">{invoiceDate}</div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-1">Invoice No.</div>
              <div className="border-b border-gray-400 pb-1 text-sm">{invoiceNo}</div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-1">Buyer's Order No.</div>
              <div className="border-b border-gray-400 pb-1 text-sm">{order.oid || '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-1">Country of Origin</div>
              <div className="border-b border-gray-400 pb-1 text-sm">INDIA</div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-1">Country of Destination</div>
              <div className="border-b border-gray-400 pb-1 text-sm">SINGAPORE</div>
            </div>
          </div>
        </div>

        {/* Consignee and Bank Section */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Consignee Section */}
          <div className="col-span-5 border border-gray-400 p-3">
            <div className="font-semibold text-sm mb-2">Consignee</div>
            <div className="text-sm min-h-[100px]">
              <div>{order.client_name || order.customer_name || '[Client Name]'}</div>
              <div className="mt-2">[Address will be filled]</div>
            </div>
          </div>

          {/* Bank and Terms */}
          <div className="col-span-7 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold mb-1">BANK</div>
              <div className="border-b border-gray-400 pb-1 text-sm">IDFC FIRST BANK LTD</div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-1">Terms of Delivery & Payments</div>
              <div className="border-b border-gray-400 pb-1 text-sm">C&F and CREDIT BY TT</div>
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-3">
            <div className="text-xs font-semibold mb-1">Pre-Carriage by</div>
            <div className="border-b border-gray-400 pb-1 text-sm">ON ROAD</div>
          </div>
          <div className="col-span-3">
            <div className="text-xs font-semibold mb-1">Port of Loading</div>
            <div className="border-b border-gray-400 pb-1 text-sm">CHENNAI /INDIA.</div>
          </div>
          <div className="col-span-3">
            <div className="text-xs font-semibold mb-1">Port fo Discharge</div>
            <div className="border-b border-gray-400 pb-1 text-sm">SINGAPORE</div>
          </div>
          <div className="col-span-3">
            <div className="text-xs font-semibold mb-1">Final Destination</div>
            <div className="border-b border-gray-400 pb-1 text-sm">SINGAPORE</div>
          </div>
          <div className="col-span-3">
            <div className="text-xs font-semibold mb-1">AWB NO</div>
            <div className="border-b border-gray-400 pb-1 text-sm">-</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2 text-xs font-semibold text-center" rowSpan="3">Mark & Nos</th>
                <th className="border border-gray-400 p-2 text-xs font-semibold text-center" rowSpan="3">Kind of Pkgs & Nos</th>
                <th className="border border-gray-400 p-2 text-xs font-semibold text-center" rowSpan="3">No of Pkgs</th>
                <th className="border border-gray-400 p-2 text-xs font-semibold text-center" rowSpan="3">Description of Goods</th>
                <th className="border border-gray-400 p-2 text-xs font-semibold text-center" rowSpan="3">Quantity Weight</th>
                <th className="border border-gray-400 p-2 text-xs font-semibold text-center" rowSpan="3">Rate Per/Kgs SGD</th>
                <th className="border border-gray-400 p-2 text-xs font-semibold text-center" rowSpan="3">Total Amount in SGD</th>
              </tr>
            </thead>
            <tbody>
              {/* General Description Row */}
              <tr>
                <td className="border border-gray-400 p-2 text-sm" colSpan="1">GVT</td>
                <td className="border border-gray-400 p-2 text-sm" colSpan="2"></td>
                <td className="border border-gray-400 p-2 text-sm" colSpan="4">Perishable Cargo Assorted Fresh Vegetables & Fruits</td>
              </tr>
              
              {/* Item Rows */}
              {invoiceItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2 text-sm text-center">{item.markNos}</td>
                  <td className="border border-gray-400 p-2 text-sm text-center">{item.kindOfPkgs}</td>
                  <td className="border border-gray-400 p-2 text-sm text-center">{item.noOfPkgs}</td>
                  <td className="border border-gray-400 p-2 text-sm">{item.description}</td>
                  <td className="border border-gray-400 p-2 text-sm text-right">{item.quantityWeight}</td>
                  <td className="border border-gray-400 p-2 text-sm text-right">{item.ratePerKg}</td>
                  <td className="border border-gray-400 p-2 text-sm text-right">{item.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-3">
            <div className="text-xs font-semibold mb-1">NET WT</div>
            <div className="border-b border-gray-400 pb-1 text-sm">{totalNetWeight.toFixed(2)}</div>
          </div>
          <div className="col-span-3">
            <div className="text-xs font-semibold mb-1">GRS WT</div>
            <div className="border-b border-gray-400 pb-1 text-sm">{totalGrossWeight.toFixed(2)}</div>
          </div>
          <div className="col-span-3">
            <div className="text-xs font-semibold mb-1"></div>
            <div className="border-b border-gray-400 pb-1 text-sm">{totalBoxes}</div>
          </div>
          <div className="col-span-3">
            <div className="text-xs font-semibold mb-1"></div>
            <div className="border-b border-gray-400 pb-1 text-sm font-semibold">{totalAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mb-6">
          <div className="text-sm font-semibold mb-2">SGD Amoun in words:</div>
          <div className="text-sm border-b border-gray-400 pb-2 min-h-[30px]">
            {formatAmountInWords(totalAmount).toUpperCase()}
          </div>
        </div>

        {/* Declaration */}
        <div className="mt-8">
          <div className="text-sm italic">
            We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCumPackingListDetail;
