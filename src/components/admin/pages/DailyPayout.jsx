import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DailyPayout = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Sample data - in real app, this would come from API
  const [payoutData] = useState([
    {
      date: '2024-01-15',
      ordersAssigned: 3,
      basePay: 3000, // 3 orders * 1000
      fuelExpenses: 500,
      excessKM: 200,
      advancePay: 800,
      totalPayout: 2900, // 3000 + 500 + 200 - 800
      status: 'Pending'
    },
    {
      date: '2024-01-14',
      ordersAssigned: 2,
      basePay: 2000,
      fuelExpenses: 300,
      excessKM: 150,
      advancePay: 500,
      totalPayout: 1950,
      status: 'Paid'
    },
    {
      date: '2024-01-13',
      ordersAssigned: 4,
      basePay: 4000,
      fuelExpenses: 600,
      excessKM: 0,
      advancePay: 1000,
      totalPayout: 3600,
      status: 'Paid'
    },
    {
      date: '2024-01-12',
      ordersAssigned: 1,
      basePay: 1000,
      fuelExpenses: 200,
      excessKM: 100,
      advancePay: 0,
      totalPayout: 1300,
      status: 'Pending'
    }
  ]);

  const handlePay = (date) => {
    // Handle payment logic here
    // console.log(`Processing payment for ${date}`);
  };

  const getStatusColor = (status) => {
    return status === 'Paid' 
      ? 'bg-emerald-100 text-emerald-700' 
      : 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/drivers/${id}`)}
            className="flex items-center gap-2 text-[#0D5C4D] hover:text-[#0a6354] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Driver Details</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daily Payout</h1>
          <p className="text-gray-600 mt-1">Manage daily payouts for driver</p>
        </div>

        {/* Payout Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D4F4E8]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Orders</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Base Pay</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Fuel Expenses</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Excess KM</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Advance Pay</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Total Payout</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Action</th>
                </tr>
              </thead>
              <tbody>
                {payoutData.map((payout, index) => (
                  <tr key={index} className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#0D5C4D] text-sm">
                        {new Date(payout.date).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#0D5C4D] text-sm">{payout.ordersAssigned}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#0D5C4D] text-sm">₹{payout.basePay.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-green-600 text-sm">+₹{payout.fuelExpenses.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-green-600 text-sm">+₹{payout.excessKM.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-red-600 text-sm">-₹{payout.advancePay.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0D5C4D] text-sm">₹{payout.totalPayout.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'Pending' ? (
                        <button
                          onClick={() => handlePay(payout.date)}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors"
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
            <div className="text-sm text-[#6B8782]">
              Showing {payoutData.length} days of payout data
            </div>
            <div className="text-sm font-semibold text-[#0D5C4D]">
              Total Pending: <span className="text-[#0D7C66]">
                ₹{payoutData.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.totalPayout, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPayout;