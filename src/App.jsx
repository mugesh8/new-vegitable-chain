import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/admin/auth/Login'
import Signup from './components/admin/auth/Signup'
import Dashboard from './components/admin/pages/Dashboard'
import Layout from './components/admin/Layout'
import Notifications from './components/admin/pages/Notification'
import VendorManagement from './components/admin/pages/VendorManagement'
import Farmers from './components/admin/pages/FarmerManagement'
import AddFarmer from './components/admin/pages/AddFarmer'
import EditFarmer from './components/admin/pages/EditFarmer'
import FarmerDetails from './components/admin/pages/FarmerDetails'
import FarmerIndividualOrderHistory from './components/admin/pages/FarmerIndividualOrderHistory'
import FarmerOrderDetails from './components/admin/pages/FarmerOrderDetails'
import FarmerPayout from './components/admin/pages/FarmerPayout'
import VegetableAvailability from './components/admin/pages/VegetableAvailability'
import VendorDetails from './components/admin/pages/VendorDetails'
import AddVendorForm from './components/admin/pages/AddVendor'
import EditVendorDetails from './components/admin/pages/EditVendor'
import SupplierDashboard from './components/admin/pages/SupplierManagement'
import AddSupplierForm from './components/admin/pages/AddSupplier'
import SupplierDetails from './components/admin/pages/SupplierDetails'
import EditSupplier from './components/admin/pages/EditSupplier'
import SupplierIndividualOrderHistory from './components/admin/pages/SupplierIndividualOrderHistory'
import SupplierPayout from './components/admin/pages/SupplierPayout'
import ThirdPartyManagement from './components/admin/pages/ThirdPartyManagement'
import AddThirdParty from './components/admin/pages/AddThirdParty'
import EditThirdParty from './components/admin/pages/EditThirdParty'
import ThirdPartyDetails from './components/admin/pages/ThirdPartyDetails'
import ThirdPartyIndividualOrderHistory from './components/admin/pages/ThirdPartyIndividualOrderHistory'
import ThirdPartyPayout from './components/admin/pages/ThirdPartyPayout'
import DriverManagement from './components/admin/pages/DriverManagement'
import AddDriver from './components/admin/pages/AddDriver'
import EditDriver from './components/admin/pages/EditDriver'
import DriverDetails from './components/admin/pages/DriverDetails'
import DriverAirportDelivery from './components/admin/pages/DriverAirportDelivery'
import DriverLocalPickups from './components/admin/pages/DriverLocalPickups'
import AddFuelExpenses from './components/admin/pages/AddFuelExpenses'
import AddAdvancePay from './components/admin/pages/AddAdvancePay'
import FuelExpenseManagement from './components/admin/pages/FuelExpenseManagement'
import ViewFuelExpense from './components/admin/pages/ViewFuelExpense'
import EditFuelExpense from './components/admin/pages/EditFuelExpense'
import AdvancePayManagement from './components/admin/pages/AdvancePayManagement'
import ViewAdvancePay from './components/admin/pages/ViewAdvancePay'
import EditAdvancePay from './components/admin/pages/EditAdvancePay'
import RemarksManagement from './components/admin/pages/RemarksManagement'
import AddRemarks from './components/admin/pages/AddRemarks'
import ViewRemarks from './components/admin/pages/ViewRemarks'
import EditRemarks from './components/admin/pages/EditRemarks'
import DailyPayout from './components/admin/pages/DailyPayout'
import PayoutManagement from './components/admin/pages/PayoutManagement'
import PayoutLabour from './components/admin/pages/PayoutLabour'
import PayoutDriver from './components/admin/pages/PayoutDriver'
import RolesPermissionSystem from './components/admin/pages/RolesAndPermissionsManagements'
import LabourManagement from './components/admin/pages/LabourManagement'
import LabourAdd from './components/admin/pages/LabourAdd'
import LabourEdit from './components/admin/pages/LabourEdit'
import LabourDetails from './components/admin/pages/LabourDetails'
import LabourDailyWorks from './components/admin/pages/LabourDailyWorks'
import LabourAttendance from './components/admin/pages/LabourAttendance'
import LabourDailyPayout from './components/admin/pages/LabourDailyPayout'
import LabourExcessPayManagement from './components/admin/pages/LabourExcessPayManagement'
import AddLabourExcessPay from './components/admin/pages/AddLabourExcessPay'
import EditLabourExcessPay from './components/admin/pages/EditLabourExcessPay'
import DriveAttendance from './components/admin/pages/DriveAttendance'
import ReportManagement from './components/admin/pages/ReportManagement'
import ReportFarmer from './components/admin/pages/ReportFarmer'
import ReportSupplier from './components/admin/pages/ReportSupplier'
import ReportThirdParty from './components/admin/pages/ReportThirdParty'
import ReportLabour from './components/admin/pages/ReportLabour'
import ReportInvoice from './components/admin/pages/ReportInvoice'
import ReportPayout from './components/admin/pages/ReportPayout'
import ReportOrder from './components/admin/pages/ReportOrder'
import ReportOrderView from './components/admin/pages/ReportOrderView'
import ReportFarmerView from './components/admin/pages/ReportFarmerView'
import ReportFarmerOrderView from './components/admin/pages/ReportFarmerOrderView'
import ReportSupplierView from './components/admin/pages/ReportSupplierView'
import ReportSupplierOrderView from './components/admin/pages/ReportSupplierOrderView'
import ReportThirdPartyView from './components/admin/pages/ReportThirdPartyView'
import ReportThirdPartyOrderView from './components/admin/pages/ReportThirdPartyOrderView'
import AddProduct from './components/admin/pages/AddProduct'
import OrderManagementList from './components/admin/pages/OrderManagement'
import OrderCreate from './components/admin/pages/OrderCreate'
import OrderView from './components/admin/pages/OrderView'
import PreOrder from './components/admin/pages/PreOrder'
import OrderAssignManagement from './components/admin/pages/OrderAssignManagement'
import OrderAssignCreateStage1 from './components/admin/pages/OrderAssignCreateStage1'
import OrderAssignCreateStage2 from './components/admin/pages/OrderAssignCreateStage2'
import OrderAssignCreateStage3 from './components/admin/pages/OrderAssignCreateStage3'
import OrderAssignCreateStage4 from './components/admin/pages/OrderAssignCreateStage4'
import OrderAssignEdit from './components/admin/pages/OrderAssignEdit'
import LocalOrderAssign from './components/admin/pages/LocalOrderAssign'
import StockManagement from './components/admin/pages/StockManagement'
import StockReassignmentForm from './components/admin/pages/StockReassignmentForm'
import PackingInventory from './components/admin/pages/PackingInventory'
import PayoutFormulas from './components/admin/pages/PayoutFormulas'
import Airport from './components/admin/pages/Airport'
import AddInventory from './components/admin/pages/AddInventory'
import EditInventory from './components/admin/pages/EditInventory'
import PetrolBunkManagement from './components/admin/pages/PetrolBunkManagement'
import LabourRateManagement from './components/admin/pages/LabourRateManagement'
import DriverRateManagement from './components/admin/pages/DriverRateManagement'
import InventoryCompany from './components/admin/pages/InventoryCompany'
import AddCustomers from './components/admin/pages/AddCustomers'
import StartEndKMManagement from './components/admin/pages/StartEndKMManagement'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/vendors" element={<ProtectedRoute><Layout><VendorManagement /></Layout></ProtectedRoute>} />
        <Route path="/vendors/:id" element={<ProtectedRoute><Layout><VendorDetails /></Layout></ProtectedRoute>} />
        <Route path="/vendors/add" element={<ProtectedRoute><Layout><AddVendorForm /></Layout></ProtectedRoute>} />
        <Route path="/vendors/:id/edit" element={<ProtectedRoute><Layout><EditVendorDetails /></Layout></ProtectedRoute>} />
        <Route path="/farmers" element={<ProtectedRoute><Layout><Farmers /></Layout></ProtectedRoute>} />
        <Route path="/farmers/add" element={<ProtectedRoute><Layout><AddFarmer /></Layout></ProtectedRoute>} />
        <Route path="/farmers/:id/edit" element={<ProtectedRoute><Layout><EditFarmer /></Layout></ProtectedRoute>} />
        <Route path="/farmers/:id" element={<ProtectedRoute><Layout><FarmerDetails /></Layout></ProtectedRoute>} />
        <Route path="/farmers/:id/orders" element={<ProtectedRoute><Layout><FarmerIndividualOrderHistory /></Layout></ProtectedRoute>} />
        <Route path="/farmers/:id/orders/:orderId" element={<ProtectedRoute><Layout><OrderView /></Layout></ProtectedRoute>} />
        <Route path="/farmers/:id/order-details" element={<ProtectedRoute><Layout><FarmerOrderDetails /></Layout></ProtectedRoute>} />
        <Route path="/farmers/:id/payout" element={<ProtectedRoute><Layout><FarmerPayout /></Layout></ProtectedRoute>} />
        <Route path="/farmers/:id/vegetable-availability" element={<ProtectedRoute><Layout><VegetableAvailability /></Layout></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><Layout><SupplierDashboard /></Layout></ProtectedRoute>} />
        <Route path="/suppliers/add" element={<ProtectedRoute><Layout><AddSupplierForm /></Layout></ProtectedRoute>} />
        <Route path="/suppliers/:id/edit" element={<ProtectedRoute><Layout><EditSupplier /></Layout></ProtectedRoute>} />
        <Route path="/suppliers/:id" element={<ProtectedRoute><Layout><SupplierDetails /></Layout></ProtectedRoute>} />
        <Route path="/suppliers/:id/orders" element={<ProtectedRoute><Layout><SupplierIndividualOrderHistory /></Layout></ProtectedRoute>} />
        <Route path="/suppliers/:id/payout" element={<ProtectedRoute><Layout><SupplierPayout /></Layout></ProtectedRoute>} />
        <Route path="/third-party" element={<ProtectedRoute><Layout><ThirdPartyManagement /></Layout></ProtectedRoute>} />
        <Route path="/third-party/add" element={<ProtectedRoute><Layout><AddThirdParty /></Layout></ProtectedRoute>} />
        <Route path="/third-party/:id/edit" element={<ProtectedRoute><Layout><EditThirdParty /></Layout></ProtectedRoute>} />
        <Route path="/third-party/:id" element={<ProtectedRoute><Layout><ThirdPartyDetails /></Layout></ProtectedRoute>} />
        <Route path="/third-party/:id/orders" element={<ProtectedRoute><Layout><ThirdPartyIndividualOrderHistory /></Layout></ProtectedRoute>} />
        <Route path="/third-party/:id/payout" element={<ProtectedRoute><Layout><ThirdPartyPayout /></Layout></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><Layout><DriverManagement /></Layout></ProtectedRoute>} />
        <Route path="/drivers/add" element={<ProtectedRoute><Layout><AddDriver /></Layout></ProtectedRoute>} />
        <Route path="/drivers/:id/edit" element={<ProtectedRoute><Layout><EditDriver /></Layout></ProtectedRoute>} />
        <Route path="/drivers/:id" element={<ProtectedRoute><Layout><DriverDetails /></Layout></ProtectedRoute>} />
        <Route path="/drivers/:id/local-pickups" element={<ProtectedRoute><Layout><DriverLocalPickups /></Layout></ProtectedRoute>} />
        <Route path="/drivers/:id/airport" element={<ProtectedRoute><Layout><DriverAirportDelivery /></Layout></ProtectedRoute>} />
        <Route path="/drivers/:id/fuel-expenses" element={<ProtectedRoute><Layout><AddFuelExpenses /></Layout></ProtectedRoute>} />
        <Route path="/drivers/:id/advance-pay" element={<ProtectedRoute><Layout><AddAdvancePay /></Layout></ProtectedRoute>} />
        <Route path="/fuel-expense-management" element={<ProtectedRoute><Layout><FuelExpenseManagement /></Layout></ProtectedRoute>} />
        <Route path="/fuel-expenses/view/:id" element={<ProtectedRoute><Layout><ViewFuelExpense /></Layout></ProtectedRoute>} />
        <Route path="/fuel-expenses/edit/:id" element={<ProtectedRoute><Layout><EditFuelExpense /></Layout></ProtectedRoute>} />
        <Route path="/start-end-km-management" element={<ProtectedRoute><Layout><StartEndKMManagement /></Layout></ProtectedRoute>} />
        <Route path="/advance-pay-management" element={<ProtectedRoute><Layout><AdvancePayManagement /></Layout></ProtectedRoute>} />
        <Route path="/advance-pay/view/:id" element={<ProtectedRoute><Layout><ViewAdvancePay /></Layout></ProtectedRoute>} />
        <Route path="/advance-pay/edit/:id" element={<ProtectedRoute><Layout><EditAdvancePay /></Layout></ProtectedRoute>} />
        <Route path="/remarks-management" element={<ProtectedRoute><Layout><RemarksManagement /></Layout></ProtectedRoute>} />
        <Route path="/drivers/:id/remarks" element={<ProtectedRoute><Layout><AddRemarks /></Layout></ProtectedRoute>} />
        <Route path="/remarks/view/:id" element={<ProtectedRoute><Layout><ViewRemarks /></Layout></ProtectedRoute>} />
        <Route path="/remarks/edit/:id" element={<ProtectedRoute><Layout><EditRemarks /></Layout></ProtectedRoute>} />
        <Route path="/drivers/:id/daily-payout" element={<ProtectedRoute><Layout><DailyPayout /></Layout></ProtectedRoute>} />
        <Route path="/drivers/attendance" element={<ProtectedRoute><Layout><DriveAttendance /></Layout></ProtectedRoute>} />
        <Route path="/labour" element={<ProtectedRoute><Layout><LabourManagement /></Layout></ProtectedRoute>} />
        <Route path="/labour/add" element={<ProtectedRoute><Layout><LabourAdd /></Layout></ProtectedRoute>} />
        <Route path="/labour/:id/edit" element={<ProtectedRoute><Layout><LabourEdit /></Layout></ProtectedRoute>} />
        <Route path="/labour/attendance" element={<ProtectedRoute><Layout><LabourAttendance /></Layout></ProtectedRoute>} />
        <Route path="/labour/excess-pay" element={<ProtectedRoute><Layout><LabourExcessPayManagement /></Layout></ProtectedRoute>} />
        <Route path="/labour/excess-pay/add" element={<ProtectedRoute><Layout><AddLabourExcessPay /></Layout></ProtectedRoute>} />
        <Route path="/labour/excess-pay/:id/edit" element={<ProtectedRoute><Layout><EditLabourExcessPay /></Layout></ProtectedRoute>} />
        <Route path="/labour/:id" element={<ProtectedRoute><Layout><LabourDetails /></Layout></ProtectedRoute>} />
        <Route path="/labour/:id/daily-works" element={<ProtectedRoute><Layout><LabourDailyWorks /></Layout></ProtectedRoute>} />
        <Route path="/labour/daily-payout" element={<ProtectedRoute><Layout><LabourDailyPayout /></Layout></ProtectedRoute>} />
        <Route path="/products/add" element={<ProtectedRoute><Layout><AddProduct /></Layout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Layout><OrderManagementList /></Layout></ProtectedRoute>} />
        <Route path="/orders/create" element={<ProtectedRoute><Layout><OrderCreate /></Layout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderView /></Layout></ProtectedRoute>} />
        <Route path="/preorders/:id" element={<ProtectedRoute><Layout><PreOrder /></Layout></ProtectedRoute>} />
        <Route path="/drafts/:id" element={<ProtectedRoute><Layout><OrderView /></Layout></ProtectedRoute>} />
        <Route path="/order-assign" element={<ProtectedRoute><Layout><OrderAssignManagement /></Layout></ProtectedRoute>} />
        <Route path="/order-assign/stage1/:id" element={<ProtectedRoute><Layout><OrderAssignCreateStage1 /></Layout></ProtectedRoute>} />
        <Route path="/order-assign/stage2/:id" element={<ProtectedRoute><Layout><OrderAssignCreateStage2 /></Layout></ProtectedRoute>} />
        <Route path="/order-assign/stage3/:id" element={<ProtectedRoute><Layout><OrderAssignCreateStage3 /></Layout></ProtectedRoute>} />
        <Route path="/order-assign/stage4/:id" element={<ProtectedRoute><Layout><OrderAssignCreateStage4 /></Layout></ProtectedRoute>} />
        <Route path="/order-assign/edit/:id" element={<ProtectedRoute><Layout><OrderAssignEdit /></Layout></ProtectedRoute>} />
        <Route path="/order-assign/local/:id" element={<ProtectedRoute><Layout><LocalOrderAssign /></Layout></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute><Layout><StockManagement /></Layout></ProtectedRoute>} />
        <Route path="/stock/:id" element={<ProtectedRoute><Layout><StockReassignmentForm /></Layout></ProtectedRoute>} />
        <Route path="/payouts" element={<ProtectedRoute><Layout><PayoutManagement /></Layout></ProtectedRoute>} />
        <Route path="/payout-labour" element={<ProtectedRoute><Layout><PayoutLabour /></Layout></ProtectedRoute>} />
        <Route path="/payout-driver" element={<ProtectedRoute><Layout><PayoutDriver /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><ReportManagement /></Layout></ProtectedRoute>} />
        <Route path="/reports/farmer" element={<ProtectedRoute><Layout><ReportFarmer /></Layout></ProtectedRoute>} />
        <Route path="/reports/supplier" element={<ProtectedRoute><Layout><ReportSupplier /></Layout></ProtectedRoute>} />
        <Route path="/reports/third-party" element={<ProtectedRoute><Layout><ReportThirdParty /></Layout></ProtectedRoute>} />
        <Route path="/reports/labour" element={<ProtectedRoute><Layout><ReportLabour /></Layout></ProtectedRoute>} />
        <Route path="/reports/invoice" element={<ProtectedRoute><Layout><ReportInvoice /></Layout></ProtectedRoute>} />
        <Route path="/reports/payout" element={<ProtectedRoute><Layout><ReportPayout /></Layout></ProtectedRoute>} />
        <Route path="/reports/order" element={<ProtectedRoute><Layout><ReportOrder /></Layout></ProtectedRoute>} />
        <Route path="/admin/report-order/:orderId" element={<ProtectedRoute><Layout><ReportOrderView /></Layout></ProtectedRoute>} />
        <Route path="/admin/report-farmer/:farmerId" element={<ProtectedRoute><Layout><ReportFarmerView /></Layout></ProtectedRoute>} />
        <Route path="/admin/report-farmer/:farmerId/order/:orderId" element={<ProtectedRoute><Layout><ReportFarmerOrderView /></Layout></ProtectedRoute>} />
        <Route path="/admin/report-supplier/:supplierId" element={<ProtectedRoute><Layout><ReportSupplierView /></Layout></ProtectedRoute>} />
        <Route path="/admin/report-supplier/:supplierId/order/:orderId" element={<ProtectedRoute><Layout><ReportSupplierOrderView /></Layout></ProtectedRoute>} />
        <Route path="/admin/report-third-party/:thirdPartyId" element={<ProtectedRoute><Layout><ReportThirdPartyView /></Layout></ProtectedRoute>} />
        <Route path="/admin/report-third-party/:thirdPartyId/order/:orderId" element={<ProtectedRoute><Layout><ReportThirdPartyOrderView /></Layout></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><Layout><RolesPermissionSystem /></Layout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><PackingInventory /></Layout></ProtectedRoute>} />
        <Route path="/settings/inventory-company" element={<ProtectedRoute><Layout><InventoryCompany /></Layout></ProtectedRoute>} />
        <Route path="/settings/createinventory" element={<ProtectedRoute><Layout><AddInventory /></Layout></ProtectedRoute>} />
        <Route path="/settings/editinventory" element={<ProtectedRoute><Layout><EditInventory /></Layout></ProtectedRoute>} />
        <Route path="/settings/airport" element={<ProtectedRoute><Layout><Airport /></Layout></ProtectedRoute>} />
        <Route path="/settings/payout-formulas" element={<ProtectedRoute><Layout><PayoutFormulas /></Layout></ProtectedRoute>} />
        <Route path="/settings/petroleum" element={<ProtectedRoute><Layout><PetrolBunkManagement /></Layout></ProtectedRoute>} />
        <Route path="/settings/labour-rate" element={<ProtectedRoute><Layout><LabourRateManagement /></Layout></ProtectedRoute>} />
        <Route path="/settings/driver-rate" element={<ProtectedRoute><Layout><DriverRateManagement /></Layout></ProtectedRoute>} />
        <Route path="/settings/customers" element={<ProtectedRoute><Layout><AddCustomers /></Layout></ProtectedRoute>} />
        <Route path="/" element={localStorage.getItem('authToken') ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App