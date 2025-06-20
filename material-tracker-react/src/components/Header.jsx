import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogOut, Sun, Moon } from 'lucide-react';

const Header = () => {
  const { currentUser } = useAuth();
  const { theme, setTheme } = useLayout();

  const handleSignOut = () => signOut(auth);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
        GBARAN GBCD MATERIAL PROCUREMENT TRACKER
      </h1>
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200" title={currentUser?.email}>{currentUser?.email}</p>
        </div>
        <button 
            onClick={handleSignOut} 
            className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
            title="Sign Out"
        >
            <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
