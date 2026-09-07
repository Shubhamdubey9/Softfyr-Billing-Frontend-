import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../modules/auth/pages/Login';
import OwnerProfileStep1Page from '../modules/onboarding/pages/OwnerProfileStep1Page';
import BusinessProfileStep2Page from '../modules/onboarding/pages/BusinessProfileStep2Page';
import ChoosePackagePage from '../modules/onboarding/pages/ChoosePackagePage';
import ProtectedRoute from '../components/ProtectedRoute';
import { AdminRoutes } from './adminRoutes';
import { VendorRoutes } from './vendorRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Onboarding Flow Routes (Screen 1, Screen 2, Screen 3) */}
      <Route
        path="/create-business-profile"
        element={<Navigate to="/create-business-profile/step-1" replace />}
      />
      <Route
        path="/create-business-profile/step-1"
        element={
          <ProtectedRoute allowedRoles={['TENANT_ADMIN', 'EMPLOYEE', 'ADMIN']}>
            <OwnerProfileStep1Page />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-business-profile/step-2"
        element={
          <ProtectedRoute allowedRoles={['TENANT_ADMIN', 'EMPLOYEE', 'ADMIN']}>
            <BusinessProfileStep2Page />
          </ProtectedRoute>
        }
      />
      <Route
        path="/choose-package"
        element={
          <ProtectedRoute allowedRoles={['TENANT_ADMIN', 'EMPLOYEE', 'ADMIN']}>
            <ChoosePackagePage />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Module Routes */}
      {AdminRoutes}

      {/* Vendor Store Operations Module Routes */}
      {VendorRoutes}

      {/* Default Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
