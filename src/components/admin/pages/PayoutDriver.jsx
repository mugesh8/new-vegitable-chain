import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const DriverPayoutManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('driver');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const stats = [
    { label: 'Total Payouts', value: '86', change: '+12%' },
    { label: 'Total Deliveries', value: '72', change: '+8%' },
    { label: 'Paid This Month', value: '₹12.4 L', change: '24 Drivers' },
    { label: 'Active Drivers', value: '28', change: '156 Transactions' }
  ];

  const driverPayouts = [
    {
      driverName: 'Vikram Mehta',
      vehicle: 'TN-09-AB-1234',
      driverId: 'DRV-001',
      deliveries: '28 trips',
      distance: '345 km',
      fuelCost: '-₹2,450',
      netAmount: '₹11,550',
      status: 'Pending',
      action: 'Pay'
    },
    {
      driverName: 'Arjun Reddy',
      vehicle: 'TN-12-CD-5678',
      driverId: 'DRV-007',
      deliveries: '32 trips',
      distance: '428 km',
      fuelCost: '-₹3,100',
      netAmount: '₹12,900',
      status: 'Paid',
      action: 'View'
    },
    {
      driverName: 'Karthik Iyer',
      vehicle: 'TN-07-EF-9012',
      driverId: 'DRV-012',
      deliveries: '25 trips',
      distance: '312 km',
      fuelCost: '-₹2,200',
      netAmount: '₹10,300',
      status: 'Pending',
      action: 'Pay'
    },
    {
      driverName: 'Sanjay Sharma',
      vehicle: 'TN-11-GH-3456',
      driverId: 'DRV-018',
      deliveries: '30 trips',
      distance: '385 km',
      fuelCost: '-₹2,800',
      netAmount: '₹12,200',
      status: 'Pending',
      action: 'Pay'
    },
    {
      driverName: 'Manoj Kumar',
      vehicle: 'TN-05-IJ-7890',
      driverId: 'DRV-023',
      deliveries: '35 trips',
      distance: '456 km',
      fuelCost: '-₹3,350',
      netAmount: '₹14,150',
      status: 'Paid',
      action: 'View'
    }
  ];

  const getStatusColor = (status) => {
    return status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700';
  };

  const getActionButton = (action) => {
    if (action === 'Pay') {
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
            onClick={() => navigate('/payout-labour')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Labour Payout
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-[#0D7C66] text-white shadow-md"
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

        {/* Driver Payouts Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D4F4E8]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Driver Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Driver ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Deliveries
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Distance (KM)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Fuel Cost
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
                {driverPayouts.map((payout, index) => (
                  <tr key={index} className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#0D5C4D] text-sm">{payout.driverName}</div>
                      <div className="text-xs text-[#6B8782]">Vehicle: {payout.vehicle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#0D5C4D]">{payout.driverId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#0D5C4D]">{payout.deliveries}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#0D5C4D]">{payout.distance}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-red-600">{payout.fuelCost}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#0D5C4D]">{payout.netAmount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className={`px-6 py-2 rounded-lg text-xs font-semibold transition-colors ${getActionButton(payout.action)}`}>
                        {payout.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>



          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
            <div className="text-sm text-[#6B8782]">
              Showing 5 of 28 Drivers
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">
                &lt;
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors bg-[#0D8568] text-white">
                1
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                2
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                3
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                4
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                5
              </button>
              <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">
                ...
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                6
              </button>
              <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">
                &gt;
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default DriverPayoutManagement;