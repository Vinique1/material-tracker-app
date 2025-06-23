import React, { lazy, Suspense } from 'react'; // MODIFIED: Import lazy and Suspense
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import { LayoutProvider } from './context/LayoutContext';
import Login from './components/Login';
import MainLayout from './layouts/MainLayout';
import Loading from './components/Loading'; // NEW: Import the loading component

// NEW: Convert static imports to dynamic imports for lazy loading
const MaterialListPage = lazy(() => import('./pages/MaterialListPage'));
const LogPage = lazy(() => import('./pages/LogPage'));

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
    // NEW: Wrap Routes in a Suspense component with a loading fallback
    <Suspense fallback={<Loading />}>
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
          <Route path="balanced-materials" element={<MaterialListPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
