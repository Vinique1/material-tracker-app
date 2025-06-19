import React from 'react';
import { useAuth } from './context/authContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogOut } from 'lucide-react';

const Header = () => {
  const { currentUser } = useAuth();
  const handleSignOut = () => signOut(auth);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">GBARAN GCBD Phase 2 - Material Tracker</h1>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600 font-medium">{currentUser?.email}</span>
          <button onClick={handleSignOut} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;