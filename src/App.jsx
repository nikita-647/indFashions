import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import ProtectedRoute from "components/auth/ProtectedRoute";
import GuestRoute from "components/auth/GuestRoute";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="auth/*"
          element={
            <GuestRoute>
              <AuthLayout />
            </GuestRoute>
          }
        />
        <Route
          path="admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        {/* <Route path="rtl/*" element={<RtlLayout />} /> */}
        <Route path="/" element={<Navigate to="./auth/sign-in" replace />} />
      </Routes>
    </>
  );
};

export default App;
