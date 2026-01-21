import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Package, 
  Clock,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Check
} from 'lucide-react';

const Notifications = () => {
  const [filter, setFilter] = useState('all'); // all, unread, read

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
      timestamp: '2024-11-15 10:25 AM',
      unread: true,
      category: 'Orders'
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
      timestamp: '2024-11-15 10:15 AM',
      unread: true,
      category: 'Payouts'
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
      timestamp: '2024-11-15 09:58 AM',
      unread: false,
      category: 'Orders'
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
      timestamp: '2024-11-15 09:30 AM',
      unread: false,
      category: 'Inventory'
    },
    {
      id: 5,
      type: 'success',
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Driver completed delivery to Line Airport',
      description: 'Order #1842 - Driver: John Smith',
      time: '2 hours ago',
      timestamp: '2024-11-15 08:30 AM',
      unread: false,
      category: 'Deliveries'
    },
    {
      id: 6,
      type: 'info',
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'New farmer registration',
      description: 'Sunrise Organic Farms has registered',
      time: '3 hours ago',
      timestamp: '2024-11-15 07:30 AM',
      unread: false,
      category: 'Farmers'
    },
    {
      id: 7,
      type: 'success',
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Quality check passed',
      description: 'Batch #2341 approved for delivery',
      time: '4 hours ago',
      timestamp: '2024-11-15 06:30 AM',
      unread: false,
      category: 'Quality'
    },
    {
      id: 8,
      type: 'warning',
      icon: AlertTriangle,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'Driver delay reported',
      description: 'Order #1839 - Estimated 30 min delay',
      time: '5 hours ago',
      timestamp: '2024-11-15 05:30 AM',
      unread: false,
      category: 'Deliveries'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.unread;
    if (filter === 'read') return !notification.unread;
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Notifications</h1>
            <p className="text-sm sm:text-base text-gray-500">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Check className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden sm:inline">Mark all as read</span>
              <span className="sm:hidden">Mark all</span>
            </button>
            <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
              <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden sm:inline">Clear all</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-[#0D7C66] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === 'unread'
                  ? 'bg-[#0D7C66] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === 'read'
                  ? 'bg-[#0D7C66] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7C66] focus:border-transparent text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications found</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-4 sm:p-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  notification.unread ? 'bg-blue-50/30' : ''
                } ${index === filteredNotifications.length - 1 ? 'border-b-0' : ''}`}
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`${notification.iconBg} w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${notification.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm sm:text-base font-semibold pr-2 ${
                        notification.type === 'urgent' ? 'text-red-600' : 
                        notification.type === 'success' ? 'text-green-600' :
                        notification.type === 'warning' ? 'text-orange-600' :
                        'text-blue-600'
                      }`}>
                        {notification.title}
                      </h4>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      {notification.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {notification.time}
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Filter className="w-3 h-3 flex-shrink-0" />
                        {notification.category}
                      </span>
                      {notification.unread && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium whitespace-nowrap">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
