import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import VendorLayout from '../layouts/VendorLayout';

// Module-wise Page Imports
import VendorDashboard from '../modules/vendor/pages/VendorDashboard';
import ProductsListPage from '../modules/products/pages/ProductsListPage';
import CreateProductPage from '../modules/products/pages/CreateProductPage';
import ProductDetailsPage from '../modules/products/pages/ProductDetailsPage';
import InventoryListPage from '../modules/inventory/pages/InventoryListPage';
import BillsListPage from '../modules/bills/pages/BillsListPage';
import CreateBillPOSPage from '../modules/bills/pages/CreateBillPOSPage';
import CreateBusinessProfilePage from '../modules/onboarding/pages/CreateBusinessProfilePage';
import SuppliersListPage from '../modules/suppliers/pages/SuppliersListPage';
import SupplierDetailsPage from '../modules/suppliers/pages/SupplierDetailsPage';
import PurchaseBillsListPage from '../modules/purchases/pages/PurchaseBillsListPage';
import CreatePurchaseBillPage from '../modules/purchases/pages/CreatePurchaseBillPage';
import PurchaseBillDetailsPage from '../modules/purchases/pages/PurchaseBillDetailsPage';
import CreatePurchaseReturnPage from '../modules/purchases/pages/CreatePurchaseReturnPage';
import PurchaseReturnsListPage from '../modules/purchases/pages/PurchaseReturnsListPage';
import PurchaseReturnDetailsPage from '../modules/purchases/pages/PurchaseReturnDetailsPage';

export const VendorRoutes = (
  <Route
    path="/vendor"
    element={
      <ProtectedRoute allowedRoles={['TENANT_ADMIN', 'EMPLOYEE']}>
        <VendorLayout />
      </ProtectedRoute>
    }
  >
    {/* Core Vendor Routes */}
    <Route index element={<Navigate to="/vendor/dashboard" replace />} />
    <Route path="dashboard" element={<VendorDashboard />} />
    <Route path="business-profile" element={<CreateBusinessProfilePage />} />
    <Route path="create-profile" element={<CreateBusinessProfilePage />} />

    {/* Products Module Routes */}
    <Route path="products" element={<ProductsListPage />} />
    <Route path="products/create" element={<CreateProductPage />} />
    <Route path="products/add" element={<CreateProductPage />} />
    <Route path="products/edit/:id" element={<CreateProductPage />} />
    <Route path="products/:id" element={<ProductDetailsPage />} />
    <Route path="products/details/:id" element={<ProductDetailsPage />} />

    {/* Sales & Inventory Routes */}
    <Route path="inventory" element={<InventoryListPage />} />
    <Route path="invoices" element={<BillsListPage />} />
    <Route path="pos" element={<CreateBillPOSPage />} />
    <Route path="sales" element={<BillsListPage />} />

    {/* Purchase Module Routes */}
    <Route path="purchases" element={<PurchaseBillsListPage />} />
    <Route path="purchases/bills" element={<PurchaseBillsListPage />} />
    <Route path="purchases/create" element={<CreatePurchaseBillPage />} />
    <Route path="purchases/bills/create" element={<CreatePurchaseBillPage />} />
    <Route path="purchases/edit/:id" element={<CreatePurchaseBillPage />} />
    <Route path="purchases/:id" element={<PurchaseBillDetailsPage />} />
    <Route path="purchases/bills/:id" element={<PurchaseBillDetailsPage />} />
    <Route path="purchases/returns" element={<PurchaseReturnsListPage />} />
    <Route path="purchases/returns/list" element={<PurchaseReturnsListPage />} />
    <Route path="purchases/returns/create" element={<CreatePurchaseReturnPage />} />
    <Route path="purchases/returns/:id" element={<PurchaseReturnDetailsPage />} />

    {/* Suppliers & Other Modules */}
    <Route path="customers" element={<VendorDashboard />} />
    <Route path="suppliers" element={<SuppliersListPage />} />
    <Route path="suppliers/:id" element={<SupplierDetailsPage />} />
    <Route path="payments" element={<VendorDashboard />} />
    <Route path="expenses" element={<VendorDashboard />} />
    <Route path="reports" element={<VendorDashboard />} />
    <Route path="employees" element={<VendorDashboard />} />
    <Route path="settings" element={<VendorDashboard />} />
  </Route>
);

