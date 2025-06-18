import React from 'react';
import { AuthProvider, useAuth } from './authContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

const App = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

const Main = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Dashboard /> : <Login />;
}

export default App;