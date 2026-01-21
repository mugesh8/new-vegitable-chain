import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Menu, User, LogOut, CheckCircle, AlertCircle, AlertTriangle, Package, Clock } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/vendors') return 'Vendor Management';
    if (path === '/vendors/add') return 'Add Vendor';
    if (path.match(/^\/vendors\/[^/]+\/edit$/)) return 'Edit Vendor';
    if (path.match(/^\/vendors\/[^/]+$/)) return 'Vendor Details';
    if (path === '/farmers') return 'Farmer Management';
    if (path === '/farmers/add') return 'Add Farmer';
    if (path.match(/^\/farmers\/\d+\/edit$/)) return 'Edit Farmer';
    if (path.match(/^\/farmers\/\d+\/orders$/)) return 'Order History';
    if (path.match(/^\/farmers\/\d+\/payout$/)) return 'Farmer Payout';
    if (path.match(/^\/farmers\/\d+$/)) return 'Farmer Details';
    if (path === '/notifications') return 'Notifications';
    if (path === '/drivers') return 'Driver Management';
    if (path === '/drivers/add') return 'Add Driver';
    if (path.match(/^\/drivers\/[^/]+\/edit$/)) return 'Edit Driver';
    if (path.match(/^\/drivers\/[^/]+$/)) return 'Driver Details';
    if (path.match(/^\/drivers\/[^/]+\/airport$/)) return 'Driver Line Airport';
    if (path === '/suppliers') return 'Supplier Management';
    if (path === '/suppliers/add') return 'Add Supplier';
    if (path.match(/^\/suppliers\/[^/]+\/edit$/)) return 'Edit Supplier';
    if (path.match(/^\/suppliers\/\d+\/orders$/)) return 'Order History';
    if (path.match(/^\/suppliers\/\d+\/payout$/)) return 'Supplier Payout';
    if (path.match(/^\/suppliers\/[^/]+$/)) return 'Supplier Details';
    if (path === '/third-party') return 'Third Party Management';
    if (path === '/third-party/add') return 'Add Third Party';
    if (path.match(/^\/third-party\/[^/]+\/edit$/)) return 'Edit Third Party';
    if (path.match(/^\/third-party\/\d+\/orders$/)) return 'Order History';
    if (path.match(/^\/third-party\/\d+\/payout$/)) return 'Third Party Payout';
    if (path.match(/^\/third-party\/[^/]+$/)) return 'Third Party Details';
    if (path === '/orders') return 'Orders';
    if(path ==='/orders/create') return 'Order Create'
    if (path === '/order-assign') return 'Order Assign';
    if (path.match(/^\/preorders\/[^/]+$/)) return 'PreOrder';
    if (path.match(/^\/order-assign\/local\/[^/]+$/)) return 'Local Order Assign';
    if (path.match(/^\/order-assign\/stage1\/[^/]+$/)) return 'Order Assign - Stage 1';
    if (path.match(/^\/order-assign\/stage2\/[^/]+$/)) return 'Order Assign - Stage 2';
    if (path === '/payouts') return 'Payout Management';
    if (path === '/payout-labour') return 'Labour Payout';
    if (path === '/payout-driver') return 'Driver Payout';
    if (path === '/roles') return 'Roles & Permissions';
    if (path === '/labour') return 'Labour Management';
    if (path === '/labour/add') return 'Add Labour';
    if (path.match(/^\/labour\/[^/]+\/edit$/)) return 'Edit Labour';
    if (path.match(/^\/labour\/[^/]+$/)) return 'Labour Details';
    if (path === '/labour/attendance') return 'Labour Attendance';
    if (path === '/labour/work-assignment') return 'Work Assignment';
    if (path === '/reports') return 'Report Management';
    if (path === '/reports/farmer') return 'Farmer Report';
    if (path === '/reports/labour') return 'Labour Report';
    if (path === '/reports/invoice') return 'Invoice Report';
    if (path === '/reports/payout') return 'Payout Report';
    if (path === '/reports/order') return 'Order Report';
    if (path === '/products/add') return 'Add Product';
    if (path.match(/^\/stock\/[^/]+$/)) return 'Reassign Stock';
    if (path === '/stock') return 'Stock Management';
    if (path === '/settings') return 'Settings';
    if (path === '/settings/airport') return 'Airport';
    if (path === '/settings/payout-formulas') return 'Payout Formulas';
    return 'Dashboard';
  };

  const notifications = [
    {
      id: 1,
      type: 'urgent',
      icon: AlertCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'Urgent: 3 orders pending local pickup',
      description: 'Local pickup deadline in 2 hours',
      time: '5 minutes ago',
      unread: true,
    },
    {
      id: 2,
      type: 'success',
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'All payouts for today completed',
      description: '156 labours paid successfully',
      time: '15 minutes ago',
      unread: true,
    },
    {
      id: 3,
      type: 'info',
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'New order #1847 created',
      description: 'Farmer: Green Valley Farms',
      time: '32 minutes ago',
      unread: false,
    },
    {
      id: 4,
      type: 'warning',
      icon: AlertTriangle,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'Low stock alert: Tomatoes',
      description: 'Only 45kg remaining in inventory',
      time: '1 hour ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Page Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#0D5C4D]">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <p className="text-xs text-gray-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif, index) => {
                    const Icon = notif.icon;
                    return (
                      <div 
                        key={notif.id} 
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notif.unread ? 'bg-blue-50/30' : ''
                        } ${index === notifications.length - 1 ? 'border-b-0' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`${notif.iconBg} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${notif.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold mb-1 ${
                              notif.type === 'urgent' ? 'text-red-600' : 
                              notif.type === 'success' ? 'text-green-600' :
                              notif.type === 'warning' ? 'text-orange-600' :
                              'text-blue-600'
                            }`}>
                              {notif.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">{notif.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{notif.time}</span>
                              {notif.unread && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 text-center border-t border-gray-200">
                  <button 
                    onClick={() => {
                      navigate('/notifications');
                      setShowNotifications(false);
                    }}
                    className="text-sm text-[#0D7C66] font-medium hover:underline"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 bg-[#41B3A2] rounded-full flex items-center justify-center text-white font-semibold">
                AD
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutModal(true);
                    setShowProfile(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600 border-t border-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
