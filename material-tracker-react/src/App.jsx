import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import MainLayout from './layouts/MainLayout';
import MaterialListPage from './pages/MaterialListPage';
import LogPage from './pages/LogPage'; // NEW: Import LogPage

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
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
        {/* NEW: Routes for Delivery and Issuance logs */}
        <Route path="delivery-log" element={<LogPage type="delivery" />} />
        <Route path="issuance-log" element={<LogPage type="issuance" />} />
      </Route>
    </Routes>
  );
};

export default App;
