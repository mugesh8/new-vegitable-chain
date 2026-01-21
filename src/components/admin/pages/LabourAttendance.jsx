import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import { getAllAttendance, markPresent, markCheckOut, markAbsent } from '../../../api/labourAttendanceApi';
import { getAllLabours } from '../../../api/labourApi';

const LabourAttendance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attendance');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({ status: 'All' });
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalRegistered: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    notMarked: 0
  });
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const attendanceRes = await getAllAttendance({ date: selectedDate, status: filters.status });

      setStats(attendanceRes.data.stats);
      
      const mergedData = attendanceRes.data.labours.map(labour => ({
        id: labour.lid,
        name: labour.full_name,
        labourId: labour.labour_id,
        phone: labour.mobile_number,
        department: labour.department,
        checkIn: labour.check_in_time || '--:-- --',
        checkOut: labour.check_out_time || '--:-- --',
        status: labour.attendance_status,
        attendanceId: labour.attendance_id
      }));

      setLabours(mergedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'labourList') {
      navigate('/labour');
    } else if (tab === 'excessPay') {
      navigate('/labour/excess-pay');
    } else if (tab === 'dailyPayout') {
      navigate('/labour/daily-payout');
    }
  };

  const handleAction = async (action, labourId) => {
    try {
      if (action === 'checkout') {
        const currentTime = new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        await markCheckOut(labourId, { time: currentTime, date: selectedDate });
      } else if (action === 'markPresent') {
        await markPresent(labourId, { date: selectedDate });
      } else if (action === 'markAbsent') {
        await markAbsent(labourId, { date: selectedDate });
      }
      await fetchData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Present': return 'bg-[#10B981]';
      case 'Absent': return 'bg-red-500';
      case 'Half Day': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredLabours = labours.filter(labour => 
    labour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    labour.labourId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleTabChange('labourList')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'labourList'
              ? 'bg-[#10B981] text-white'
              : 'bg-[#D4F4E8] text-[#0D5C4D] hover:bg-[#B8F4D8]'
          }`}
        >
          Labour List
        </button>
        <button
          onClick={() => handleTabChange('attendance')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'attendance'
              ? 'bg-[#0D7C66] text-white'
              : 'bg-[#D4F4E8] text-[#0D5C4D] hover:bg-[#B8F4D8]'
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => handleTabChange('excessPay')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'excessPay'
              ? 'bg-[#10B981] text-white'
              : 'bg-[#D4F4E8] text-[#0D5C4D] hover:bg-[#B8F4D8]'
          }`}
        >
          Excess Pay
        </button>
        <button
          onClick={() => handleTabChange('dailyPayout')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'dailyPayout'
              ? 'bg-[#10B981] text-white'
              : 'bg-[#D4F4E8] text-[#0D5C4D] hover:bg-[#B8F4D8]'
          }`}
        >
          Labour Daily Payout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0] rounded-2xl p-6 text-[#0D5C4D]">
          <div className="text-sm font-medium mb-2 opacity-90">Total Registered</div>
          <div className="text-3xl sm:text-4xl font-bold">{stats.totalRegistered}</div>
        </div>
        <div className="bg-gradient-to-r from-[#6EE7B7] to-[#34D399] rounded-2xl p-6 text-[#0D5C4D]">
          <div className="text-sm font-medium mb-2 opacity-90">Present</div>
          <div className="text-3xl sm:text-4xl font-bold">{stats.present}</div>
        </div>
        <div className="bg-gradient-to-r from-[#6EE7B7] to-[#34D399] rounded-2xl p-6 text-[#0D5C4D]">
          <div className="text-sm font-medium mb-2 opacity-90">Absent</div>
          <div className="text-3xl sm:text-4xl font-bold">{stats.absent}</div>
        </div>
        <div className="bg-gradient-to-r from-[#047857] to-[#065F46] rounded-2xl p-6 text-white">
          <div className="text-sm font-medium mb-2 opacity-90">Not Marked Yet</div>
          <div className="text-3xl sm:text-4xl font-bold">{stats.notMarked}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B8782]" size={20} />
          <input
            type="text"
            placeholder="Search labour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#D0E0DB] rounded-lg text-[#0D5C4D] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D8568]"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="appearance-none bg-white border border-[#D0E0DB] rounded-lg px-4 py-2.5 pr-10 text-sm text-[#0D5C4D] focus:outline-none focus:ring-2 focus:ring-[#0D8568] cursor-pointer min-w-[140px]"
          >
            <option value="All">Status: All</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B8782] pointer-events-none" size={16} />
        </div>

        {/* Date Picker */}
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-[#D0E0DB] rounded-lg px-4 py-2.5 text-sm text-[#0D5C4D] focus:outline-none focus:ring-2 focus:ring-[#0D8568] min-w-[180px]"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#D4F4E8]">
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-[#0D5C4D]">LABOUR INFO</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-[#0D5C4D]">CHECK-IN TIME</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-[#0D5C4D]">CHECK-OUT TIME</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-[#0D5C4D]">STATUS</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-[#0D5C4D]">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[#6B8782]">
                    Loading...
                  </td>
                </tr>
              ) : filteredLabours.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[#6B8782]">
                    No labours found
                  </td>
                </tr>
              ) : filteredLabours.map((labour, index) => (
                <tr 
                  key={labour.id} 
                  className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'
                  }`}
                >
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {getInitials(labour.name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#0D5C4D]">{labour.name}</div>
                        <div className="text-xs text-[#6B8782]">{labour.labourId} • {labour.phone}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-4">
                    <div className={`text-sm font-medium ${labour.checkIn === '--:-- --' ? 'text-[#6B8782]' : 'text-[#10B981]'}`}>
                      {labour.checkIn}
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-4">
                    <div className={`text-sm font-medium ${labour.checkOut === '--:-- --' ? 'text-[#6B8782]' : 'text-red-500'}`}>
                      {labour.checkOut}
                    </div>
                  </td>

                  <td className="px-4 sm:px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit text-white ${getStatusColor(labour.status)}`}>
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      {labour.status}
                    </span>
                  </td>

                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction('markPresent', labour.id)}
                        disabled={labour.status === 'Present' || labour.status === 'Absent' || labour.checkOut !== '--:-- --'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          labour.status === 'Present' || labour.status === 'Absent' || labour.checkOut !== '--:-- --'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#10B981] hover:bg-[#059669] text-white'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleAction('checkout', labour.id)}
                        disabled={labour.checkIn === '--:-- --' || labour.checkOut !== '--:-- --'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          labour.checkIn === '--:-- --' || labour.checkOut !== '--:-- --'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        Checkout
                      </button>
                      <button
                        onClick={() => handleAction('markAbsent', labour.id)}
                        disabled={labour.status === 'Absent' || labour.status === 'Present' || labour.checkOut !== '--:-- --'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          labour.status === 'Absent' || labour.status === 'Present' || labour.checkOut !== '--:-- --'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
          <div className="text-sm text-[#6B8782]">
            Showing {filteredLabours.length} of {labours.length} labours
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabourAttendance;