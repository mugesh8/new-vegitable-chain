import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download } from 'lucide-react';
import { getAllOrders } from '../../../api/orderApi';
import { getOrderAssignment } from '../../../api/orderAssignmentApi';
import { getAllDrivers } from '../../../api/driverApi';
import { getAllDriverRates } from '../../../api/driverRateApi';
import { getAllFuelExpenses } from '../../../api/fuelExpenseApi';
import { getAllExcessKMs } from '../../../api/excessKmApi';
import { getAllAdvancePays } from '../../../api/advancePayApi';

const DriverPayoutManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);

  const formatCurrency = (amount) => {
    const value = Number.isFinite(amount) ? amount : 0;
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  useEffect(() => {
    fetchDriverPayouts();
  }, []);

  const fetchDriverPayouts = async () => {
    try {
      setLoading(true);

      const [ordersRes, driversRes, driverRatesRes, fuelExpensesRes, excessKMsRes, advancePaysRes] = await Promise.all([
        getAllOrders().catch(() => ({ data: [], success: false })),
        getAllDrivers().catch(() => ({ data: [], success: false })),
        getAllDriverRates().catch(() => ({ data: [], success: false })),
        getAllFuelExpenses().catch(() => ({ data: [], success: false })),
        getAllExcessKMs().catch(() => ({ data: [], success: false })),
        getAllAdvancePays().catch(() => ({ data: [], success: false }))
      ]);

      const orders = ordersRes?.data || ordersRes || [];
      const drivers = driversRes?.data || driversRes || [];
      const driverRates = Array.isArray(driverRatesRes) ? driverRatesRes : (driverRatesRes?.data || []);
      const fuelExpenses = Array.isArray(fuelExpensesRes) ? fuelExpensesRes : (fuelExpensesRes?.data || []);
      const excessKMs = Array.isArray(excessKMsRes) ? excessKMsRes : (excessKMsRes?.data || []);
      const advancePays = Array.isArray(advancePaysRes) ? advancePaysRes : (advancePaysRes?.data || []);

      console.log('Driver Payout Data:', {
        ordersCount: orders.length,
        driversCount: drivers.length,
        driverRatesCount: driverRates.length,
        fuelExpensesCount: fuelExpenses.length,
        excessKMsCount: excessKMs.length
      });

      const driverMap = new Map(
        drivers.map(d => [String(d.did), d])
      );

      const ratesMap = {};
      const kmLimitMap = {};
      driverRates.forEach(rate => {
        if (rate.status === 'Active') {
          const deliveryType = (rate.deliveryType || rate.delivery_type || '').toLowerCase();
          if (deliveryType) {
            ratesMap[deliveryType] = parseFloat(rate.amount || rate.rate || 0) || 0;
            kmLimitMap[deliveryType] = parseFloat(rate.kilometers ?? rate.kilometer ?? rate.km ?? 0) || 0;
          }
        }
      });

      const toDateStr = (val) => {
        if (!val) return '';
        try {
          return new Date(val).toISOString().split('T')[0];
        } catch {
          return String(val).substring(0, 10);
        }
      };

      const fuelByDriverByDate = {};
      const fuelUnitPriceByDriverByDate = {};
      fuelExpenses.forEach(expense => {
        const driverId = String(expense.driver_id ?? expense.did ?? expense.driver?.did ?? '');
        if (!driverId) return;
        const dateStr = toDateStr(expense.date || expense.expense_date);
        if (!dateStr) return;
        if (!fuelByDriverByDate[driverId]) {
          fuelByDriverByDate[driverId] = {};
          fuelUnitPriceByDriverByDate[driverId] = {};
        }
        const unitPrice = parseFloat(expense.unit_price ?? expense.unitPrice ?? 0) || 0;
        let amt = parseFloat(expense.total_amount || expense.total || 0) || 0;
        if (!amt && unitPrice && expense.litre != null) amt = unitPrice * parseFloat(expense.litre);
        fuelByDriverByDate[driverId][dateStr] = (fuelByDriverByDate[driverId][dateStr] || 0) + amt;
        if (unitPrice) fuelUnitPriceByDriverByDate[driverId][dateStr] = unitPrice;
      });

      const advanceByDriverByDate = {};
      advancePays.forEach(adv => {
        const driverId = String(adv.driver_id ?? adv.did ?? adv.driver?.did ?? '');
        if (!driverId) return;
        const dateStr = toDateStr(adv.date || adv.pay_date || adv.createdAt);
        if (!dateStr) return;
        if (!advanceByDriverByDate[driverId]) advanceByDriverByDate[driverId] = {};
        const amt = parseFloat(adv.advance_amount ?? adv.amount ?? 0) || 0;
        advanceByDriverByDate[driverId][dateStr] = (advanceByDriverByDate[driverId][dateStr] || 0) + amt;
      });

      const excessKMByDriverByDate = {};
      const excessKMRecordByDriverByDate = {};
      const startKMByDriverByDate = {};
      const endKMByDriverByDate = {};
      excessKMs.forEach(km => {
        const driverId = String(km.driver_id ?? km.did ?? km.driver?.did ?? '');
        if (!driverId) return;
        const dateStr = toDateStr(km.date);
        if (!dateStr) return;
        if (!excessKMByDriverByDate[driverId]) {
          excessKMByDriverByDate[driverId] = {};
          excessKMRecordByDriverByDate[driverId] = {};
          startKMByDriverByDate[driverId] = {};
          endKMByDriverByDate[driverId] = {};
        }
        const startKm = parseFloat(km.start_km ?? km.startKm ?? 0) || 0;
        const endKm = parseFloat(km.end_km ?? km.endKm ?? 0) || 0;
        const amt = parseFloat(km.amount || 0) || 0;
        const recordId = km.id ?? km.ekmid ?? km.excess_km_id;
        if (startKm) {
          startKMByDriverByDate[driverId][dateStr] = startKMByDriverByDate[driverId][dateStr] != null
            ? Math.min(startKMByDriverByDate[driverId][dateStr], startKm) : startKm;
        }
        if (endKm) {
          endKMByDriverByDate[driverId][dateStr] = endKMByDriverByDate[driverId][dateStr] != null
            ? Math.max(endKMByDriverByDate[driverId][dateStr], endKm) : endKm;
        }
        excessKMByDriverByDate[driverId][dateStr] = (excessKMByDriverByDate[driverId][dateStr] || 0) + amt;
        if (recordId && !excessKMRecordByDriverByDate[driverId][dateStr]) {
          excessKMRecordByDriverByDate[driverId][dateStr] = recordId;
        }
      });
      
      console.log('Driver Rates Map:', ratesMap);

      // Map fuel expenses by driver ID (including dates)
      const fuelExpenseMap = {};
      const fuelExpenseDatesMap = {};
      fuelExpenses.forEach(expense => {
        const driverId = String(expense.driver_id || expense.did || expense.driver?.did || '');
        if (driverId) {
          if (!fuelExpenseMap[driverId]) {
            fuelExpenseMap[driverId] = 0;
            fuelExpenseDatesMap[driverId] = new Set();
          }
          const total = parseFloat(expense.total_amount || expense.total || 0);
          if (!total || isNaN(total)) {
            const unitPrice = parseFloat(expense.unit_price || 0);
            const litre = parseFloat(expense.litre || 0);
            fuelExpenseMap[driverId] += (unitPrice * litre);
          } else {
            fuelExpenseMap[driverId] += total;
          }
          // Collect fuel expense dates
          if (expense.date || expense.expense_date) {
            try {
              const dateStr = new Date(expense.date || expense.expense_date).toISOString().split('T')[0];
              fuelExpenseDatesMap[driverId].add(dateStr);
            } catch {
              const dateStr = String(expense.date || expense.expense_date);
              if (dateStr) fuelExpenseDatesMap[driverId].add(dateStr);
            }
          }
        }
      });

      // Map excess KM by driver ID
      const excessKMMap = {};
      excessKMs.forEach(km => {
        const driverId = String(km.driver_id || km.did || km.driver?.did || '');
        if (driverId) {
          if (!excessKMMap[driverId]) {
            excessKMMap[driverId] = { totalKM: 0, amount: 0, days: new Set() };
          }
          excessKMMap[driverId].totalKM += parseFloat(km.kilometers || 0);
          excessKMMap[driverId].amount += parseFloat(km.amount || 0);
          if (km.date) {
            // Normalize date to YYYY-MM-DD format
            try {
              const dateStr = new Date(km.date).toISOString().split('T')[0];
              excessKMMap[driverId].days.add(dateStr);
            } catch {
              // If date parsing fails, add as-is
              excessKMMap[driverId].days.add(String(km.date));
            }
          }
        }
      });

      // Aggregate driver wages and work days from Stage 3
      const wagesByDriverId = {};
      const workDaysByDriverId = {};

      const assignmentPromises = orders.map(async (order) => {
        try {
          const assignmentRes = await getOrderAssignment(order.oid).catch(() => null);
          if (!assignmentRes?.data) return;

          const orderDate = order.order_received_date || order.createdAt;
          const dateStr = orderDate ? new Date(orderDate).toISOString().split('T')[0] : '';

          // Check Stage 1 for driver assignments in delivery routes
          let stage1Data = null;
          try {
            if (assignmentRes.data.stage1_data) {
              stage1Data = typeof assignmentRes.data.stage1_data === 'string'
                ? JSON.parse(assignmentRes.data.stage1_data)
                : assignmentRes.data.stage1_data;
            } else if (assignmentRes.data.product_assignments) {
              // Sometimes stage1 data is stored in product_assignments
              const assignments = typeof assignmentRes.data.product_assignments === 'string'
                ? JSON.parse(assignmentRes.data.product_assignments)
                : assignmentRes.data.product_assignments;
              if (Array.isArray(assignments) && assignments.length > 0) {
                stage1Data = { deliveryRoutes: [] };
              }
            }
          } catch (e) {
            console.error('Error parsing stage1 data:', e);
          }

          // Process Stage 1 delivery routes
          if (stage1Data?.deliveryRoutes) {
            stage1Data.deliveryRoutes.forEach(route => {
              const driverName = route.driver || '';
              if (!driverName) return;

              // Extract driver name (format might be "Name - DRV-001")
              const nameParts = driverName.split(' - ');
              const cleanDriverName = nameParts[0].trim();

              const driver = drivers.find(d => 
                (d.driver_name || '').toLowerCase() === cleanDriverName.toLowerCase() ||
                (d.driver_id || '').toLowerCase() === (nameParts[1] || '').toLowerCase()
              );

              if (!driver) return;

              const driverId = String(driver.did);
              if (!wagesByDriverId[driverId]) {
                wagesByDriverId[driverId] = 0;
                workDaysByDriverId[driverId] = new Set();
              }
              // Add a base wage for the route (can be calculated from distance or use default)
              const routeWage = parseFloat(route.driverWage || route.amount || 0) || 0;
              wagesByDriverId[driverId] += routeWage;
              if (dateStr) {
                workDaysByDriverId[driverId].add(dateStr);
              }
            });
          }

          // Check Stage 3 for driver assignments
          let stage3Data = null;
          try {
            if (assignmentRes.data.stage3_summary_data) {
              stage3Data = typeof assignmentRes.data.stage3_summary_data === 'string'
                ? JSON.parse(assignmentRes.data.stage3_summary_data)
                : assignmentRes.data.stage3_summary_data;
            } else if (assignmentRes.data.stage3_data) {
              stage3Data = typeof assignmentRes.data.stage3_data === 'string'
                ? JSON.parse(assignmentRes.data.stage3_data)
                : assignmentRes.data.stage3_data;
            }
          } catch (e) {
            console.error('Error parsing stage3 data:', e);
          }

          if (!stage3Data) return;

          // Check both stage3Data.airportGroups and stage3Data.summaryData.airportGroups
          const airportGroups = stage3Data.summaryData?.airportGroups || stage3Data.airportGroups || {};
          const products = stage3Data.products || [];
          
          console.log(`Order ${order.oid} Stage 3 Data:`, {
            airportGroupsCount: Object.keys(airportGroups).length,
            productsCount: products.length,
            airportGroups: Object.keys(airportGroups),
            productDrivers: products.map(p => p.selectedDriver || p.driver || p.driverName).filter(Boolean)
          });
          
          // Also check driverAssignments from summaryData
          const driverAssignments = stage3Data.summaryData?.driverAssignments || [];
          
          // Process driverAssignments if available
          driverAssignments.forEach(assignment => {
            const driverName = assignment.driver || '';
            if (!driverName) return;

            // Extract driver name (format might be "Name - DRV-001")
            const nameParts = driverName.split(' - ');
            const cleanDriverName = nameParts[0].trim();

            const driver = drivers.find(d => 
              (d.driver_name || '').toLowerCase() === cleanDriverName.toLowerCase() ||
              (d.driver_id || '').toLowerCase() === (nameParts[1] || '').toLowerCase() ||
              String(d.did) === String(assignment.driverId || '')
            );

            if (!driver) return;

            const driverId = String(driver.did);
            if (!wagesByDriverId[driverId]) {
              wagesByDriverId[driverId] = 0;
              workDaysByDriverId[driverId] = new Set();
            }
            // Count this as a work day
            if (dateStr) {
              workDaysByDriverId[driverId].add(dateStr);
            }
          });

          // Process airport groups
          Object.values(airportGroups).forEach(group => {
            // Check driver at group level
            let driverName = group.driver || group.driverName || '';
            
            // Also check products within the group for driver assignments
            if (!driverName && group.products && Array.isArray(group.products)) {
              for (const product of group.products) {
                const productDriver = product.driver || product.selectedDriver || product.driverName || '';
                if (productDriver) {
                  driverName = productDriver;
                  break; // Use first driver found in products
                }
              }
            }
            
            if (!driverName) return;

            // Find driver by name - try multiple matching strategies
            let driver = null;
            
            // Try exact name match
            driver = drivers.find(d => 
              (d.driver_name || '').toLowerCase() === driverName.toLowerCase()
            );
            
            // If not found, try matching with driver ID format "Name - DRV-001"
            if (!driver && driverName.includes(' - ')) {
              const nameParts = driverName.split(' - ');
              const cleanName = nameParts[0].trim();
              const driverIdPart = nameParts[1]?.trim();
              
              driver = drivers.find(d => 
                (d.driver_name || '').toLowerCase() === cleanName.toLowerCase() ||
                (d.driver_id || '').toLowerCase() === driverIdPart?.toLowerCase()
              );
            }
            
            // If still not found, try partial name match
            if (!driver) {
              driver = drivers.find(d => 
                (d.driver_name || '').toLowerCase().includes(driverName.toLowerCase()) ||
                driverName.toLowerCase().includes((d.driver_name || '').toLowerCase())
              );
            }

            if (!driver) {
              console.warn(`Driver not found for name: ${driverName}`);
              return;
            }

            const driverId = String(driver.did);
            const driverWage = parseFloat(group.driverWage || group.pickupCost || 0) || 0;

            if (!wagesByDriverId[driverId]) {
              wagesByDriverId[driverId] = 0;
              workDaysByDriverId[driverId] = new Set();
            }

            wagesByDriverId[driverId] += driverWage;
            if (dateStr) {
              workDaysByDriverId[driverId].add(dateStr);
            }
          });

          // Also check products array for driver assignments
          products.forEach(product => {
            let driverName = product.selectedDriver || product.driver || product.driverName || '';
            
            // If selectedDriver is a number/ID, try to find driver by did
            if (!driverName && product.selectedDriver) {
              const driverById = drivers.find(d => String(d.did) === String(product.selectedDriver));
              if (driverById) {
                driverName = driverById.driver_name;
              }
            }
            
            if (!driverName) return;

            // Find driver by name or ID - try multiple strategies
            let driver = null;
            
            // If it's a number, try to find by did
            if (!isNaN(driverName)) {
              driver = drivers.find(d => String(d.did) === String(driverName));
            }
            
            // Try by driver_id if it contains DRV-
            if (!driver && typeof driverName === 'string' && driverName.includes('DRV-')) {
              driver = drivers.find(d => 
                (d.driver_id || '').toLowerCase() === driverName.toLowerCase()
              );
            }
            
            // Try exact name match
            if (!driver) {
              driver = drivers.find(d => 
                (d.driver_name || '').toLowerCase() === driverName.toLowerCase()
              );
            }
            
            // Try matching with "Name - DRV-001" format
            if (!driver && driverName.includes(' - ')) {
              const nameParts = driverName.split(' - ');
              const cleanName = nameParts[0].trim();
              const driverIdPart = nameParts[1]?.trim();
              
              driver = drivers.find(d => 
                (d.driver_name || '').toLowerCase() === cleanName.toLowerCase() ||
                (d.driver_id || '').toLowerCase() === driverIdPart?.toLowerCase()
              );
            }
            
            // Try partial match as last resort
            if (!driver) {
              driver = drivers.find(d => 
                (d.driver_name || '').toLowerCase().includes(driverName.toLowerCase()) ||
                driverName.toLowerCase().includes((d.driver_name || '').toLowerCase())
              );
            }

            if (!driver) {
              console.warn(`Driver not found for product assignment: ${driverName}`);
              return;
            }

            const driverId = String(driver.did);
            const driverWage = parseFloat(product.driverWage || product.pickupCost || 0) || 0;

            if (!wagesByDriverId[driverId]) {
              wagesByDriverId[driverId] = 0;
              workDaysByDriverId[driverId] = new Set();
            }

            wagesByDriverId[driverId] += driverWage;
            if (dateStr) {
              workDaysByDriverId[driverId].add(dateStr);
            }
          });
        } catch (error) {
          console.error(`Error processing order ${order.oid} for driver payouts:`, error);
        }
      });

      await Promise.all(assignmentPromises);

      console.log('Driver Payout Aggregation:', {
        wagesByDriverId: Object.keys(wagesByDriverId),
        wagesByDriverIdDetails: Object.entries(wagesByDriverId).map(([id, wage]) => ({ id, wage })),
        fuelExpenseMap: Object.keys(fuelExpenseMap),
        fuelExpenseMapDetails: Object.entries(fuelExpenseMap).map(([id, cost]) => ({ id, cost })),
        excessKMMap: Object.keys(excessKMMap),
        workDaysByDriverId: Object.keys(workDaysByDriverId),
        workDaysByDriverIdDetails: Object.entries(workDaysByDriverId).map(([id, days]) => ({ id, days: days.size }))
      });

      // All driver IDs that have any activity (work days, fuel, excess, advance)
      const allDriverIds = new Set([
        ...Object.keys(wagesByDriverId),
        ...Object.keys(fuelExpenseMap),
        ...Object.keys(excessKMMap),
        ...Object.keys(workDaysByDriverId),
        ...Object.keys(fuelByDriverByDate),
        ...Object.keys(advanceByDriverByDate),
        ...Object.keys(excessKMByDriverByDate)
      ]);

      const allRows = [];

      Array.from(allDriverIds).forEach((driverId) => {
        const driver = driverMap.get(driverId);
        if (!driver) return;

        const deliveryType = (driver.deliveryType || driver.delivery_type || 'collection').toLowerCase();
        let driverRate = ratesMap[deliveryType] || ratesMap['airport'] || ratesMap['collection'] || 0;
        if (!driverRate && driverRates.length > 0) {
          const activeRate = driverRates.find(r => r.status === 'Active');
          if (activeRate) driverRate = parseFloat(activeRate.amount || activeRate.rate || 0) || 0;
        }
        if (!driverRate && driver.daily_wage) driverRate = parseFloat(driver.daily_wage || driver.dailyWage || 0) || 0;
        if (!driverRate) driverRate = 0;

        let driverKmLimit = kmLimitMap[deliveryType] || kmLimitMap['airport'] || kmLimitMap['collection'] || 0;
        if (!driverKmLimit && driverRates.length > 0) {
          const activeRate = driverRates.find(r => r.status === 'Active');
          if (activeRate) driverKmLimit = parseFloat(activeRate.kilometers ?? activeRate.kilometer ?? activeRate.km ?? 0) || 0;
        }

        const orderWorkDays = workDaysByDriverId[driverId] || new Set();
        const fuelDates = Object.keys(fuelByDriverByDate[driverId] || {});
        const advanceDates = Object.keys(advanceByDriverByDate[driverId] || {});
        const excessDates = Object.keys(excessKMByDriverByDate[driverId] || {});
        const startKMDates = Object.keys(startKMByDriverByDate[driverId] || {});
        const endKMDates = Object.keys(endKMByDriverByDate[driverId] || {});

        const allDates = new Set([
          ...orderWorkDays,
          ...fuelDates,
          ...advanceDates,
          ...excessDates,
          ...startKMDates,
          ...endKMDates
        ]);

        Array.from(allDates)
          .sort()
          .reverse()
          .forEach((dateStr) => {
            const basePay = driverRate;
            const fuel = (fuelByDriverByDate[driverId] || {})[dateStr] || 0;
            const advancePay = (advanceByDriverByDate[driverId] || {})[dateStr] || 0;
            const startKM = (startKMByDriverByDate[driverId] || {})[dateStr];
            const endKM = (endKMByDriverByDate[driverId] || {})[dateStr];

            let excessDistanceKM = 0;
            if (driverKmLimit && startKM != null && endKM != null) {
              const travelled = Math.max(endKM - startKM, 0);
              excessDistanceKM = Math.max(travelled - driverKmLimit, 0);
            }

            const unitPrice = (fuelUnitPriceByDriverByDate[driverId] || {})[dateStr] || 0;
            const savedAmount = (excessKMByDriverByDate[driverId] || {})[dateStr];
            const hasManualAmount = savedAmount != null && Number(savedAmount) > 0;
            let excessKMPrice = 0;
            if (hasManualAmount) {
              excessKMPrice = Number(savedAmount);
            } else if (unitPrice && excessDistanceKM > 0) {
              excessKMPrice = excessDistanceKM * unitPrice;
            }

            const totalPayout = basePay - fuel - advancePay + excessKMPrice;
            const status = 'Pending';

            allRows.push({
              id: `${driverId}-${dateStr}`,
              driverId,
              driverName: driver.driver_name || 'Unknown Driver',
              driverCode: driver.driver_id || `DRV-${driverId}`,
              vehicle: driver.vehicle_number || 'N/A',
              date: dateStr,
              basePay,
              fuelExpenses: fuel,
              startKM,
              endKM,
              excessKM: excessDistanceKM,
              excessKMPrice,
              advancePay,
              totalPayout,
              status
            });
          });
      });

      allRows.sort((a, b) => {
        const dateCmp = (b.date || '').localeCompare(a.date || '');
        if (dateCmp !== 0) return dateCmp;
        return (a.driverName || '').localeCompare(b.driverName || '');
      });

      setPayouts(allRows);
    } catch (error) {
      console.error('Error fetching driver payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (payoutId) => {
    setPayouts(prevPayouts =>
      prevPayouts.map(payout =>
        payout.id === payoutId
          ? { ...payout, status: 'Paid' }
          : payout
      )
    );
  };

  const formatNum = (n) =>
    Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0';

  const filteredPayouts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return payouts;
    return payouts.filter(p =>
      (p.driverName || '').toLowerCase().includes(query) ||
      (p.driverCode || '').toLowerCase().includes(query) ||
      (p.vehicle || '').toLowerCase().includes(query) ||
      (p.date || '').toLowerCase().includes(query)
    );
  }, [payouts, searchQuery]);

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayouts = filteredPayouts.slice(startIndex, startIndex + itemsPerPage);

  const summaryStats = useMemo(() => {
    const totalPayouts = payouts.length;
    const totalAmount = payouts.reduce((sum, p) => sum + (p.totalPayout || 0), 0);
    const uniqueDrivers = new Set(payouts.map(p => p.driverId)).size;
    const totalDeliveries = payouts.length;
    const activeDrivers = uniqueDrivers;

    return {
      totalPayouts,
      totalDeliveries,
      totalAmount,
      activeDrivers
    };
  }, [payouts]);

  const stats = [
    { label: 'Total Payouts', value: summaryStats.totalPayouts.toString(), change: '' },
    { label: 'Total Deliveries', value: summaryStats.totalDeliveries.toString(), change: '' },
    { label: 'Paid This Month', value: formatCurrency(summaryStats.totalAmount), change: `${summaryStats.activeDrivers} Drivers` },
    { label: 'Active Drivers', value: summaryStats.activeDrivers.toString(), change: `${summaryStats.totalDeliveries} Days` }
  ];

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
            onClick={() => navigate('/payout-labour')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Labour Payout
          </button>
          <button
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Driver Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Driver ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Base Pay</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Fuel Expenses</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Start KM</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">End KM</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Excess KM</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Excess KM Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Advance Pay</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Total Payout</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="13" className="px-6 py-8 text-center text-[#6B8782]">
                      Loading driver payouts...
                    </td>
                  </tr>
                ) : paginatedPayouts.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="px-6 py-8 text-center text-[#6B8782]">
                      No driver payouts found
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
                        <div className="font-semibold text-[#0D5C4D] text-sm">{payout.driverName}</div>
                        <div className="text-xs text-[#6B8782]">Vehicle: {payout.vehicle}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#0D5C4D]">{payout.driverCode}</td>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">
                        {payout.date ? new Date(payout.date + 'T12:00:00').toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#0D5C4D]">₹{formatNum(payout.basePay)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-red-600">-₹{formatNum(payout.fuelExpenses)}</td>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">
                        {payout.startKM != null ? `${formatNum(payout.startKM)} km` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">
                        {payout.endKM != null ? `${formatNum(payout.endKM)} km` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">
                        {payout.excessKM != null && payout.excessKM > 0 ? `${formatNum(payout.excessKM)} km` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">+₹{formatNum(payout.excessKMPrice || 0)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-red-600">-₹{formatNum(payout.advancePay)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#0D5C4D]">₹{formatNum(payout.totalPayout)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/drivers/${payout.driverId}/daily-payout`)}
                          className="px-3 py-1.5 text-xs font-medium text-[#0D5C4D] border border-[#0D5C4D] rounded-lg hover:bg-[#D4F4E8] transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handlePayClick(payout.id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${getActionButton(payout.status)}`}
                        >
                          {payout.status === 'Paid' ? 'Paid' : 'Pay'}
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
              {Math.min(startIndex + itemsPerPage, filteredPayouts.length)} of {filteredPayouts.length} daily payouts
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

export default DriverPayoutManagement;