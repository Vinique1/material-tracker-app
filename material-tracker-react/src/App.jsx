import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import Login from './components/Login';
import MainLayout from './layouts/MainLayout';
import MaterialListPage from './pages/MaterialListPage';
import LogPage from './pages/LogPage';

const App = () => {
  return (
    <AuthProvider>
      <LayoutProvider>
        <AppRoutes />
      </LayoutProvider>
    </AuthProvider>
  );
};

const AppRoutes = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<MaterialListPage />} />
        <Route path="category/:filterValue" element={<MaterialListPage />} />
        <Route path="supplier/:filterValue" element={<MaterialListPage />} />
        <Route path="status/surplus" element={<MaterialListPage statusFilter="surplus" />} />
        <Route path="status/deficit" element={<MaterialListPage statusFilter="deficit" />} />
        <Route path="status/exact" element={<MaterialListPage statusFilter="exact" />} />
        <Route path="delivery-log" element={<LogPage type="delivery" />} />
        <Route path="issuance-log" element={<LogPage type="issuance" />} />
        {/* NEW: Route for the Balanced Materials page */}
        <Route path="balanced-materials" element={<MaterialListPage />} />
      </Route>
    </Routes>
  );
};

export default App;
