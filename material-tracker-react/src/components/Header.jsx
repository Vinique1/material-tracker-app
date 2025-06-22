import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogOut, Sun, Moon, Monitor } from 'lucide-react'; // Import all necessary icons

const Header = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = () => signOut(auth);

  // Determine which icon to show based on the current theme
  const getNextThemeAndIcon = () => {
    if (theme === 'light') {
      return { nextTheme: 'dark', icon: <Moon size={20} />, title: "Switch to Dark Mode" };
    }
    if (theme === 'dark') {
      return { nextTheme: 'system', icon: <Monitor size={20} />, title: "Switch to System Preference" };
    }
    // If theme is 'system' or anything else, default to light
    return { nextTheme: 'light', icon: <Sun size={20} />, title: "Switch to Light Mode" };
  };

  const { nextTheme, icon: currentIcon, title: iconTitle } = getNextThemeAndIcon();

  const handleThemeToggleClick = () => {
    toggleTheme(nextTheme);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
        GBARAN GBCD MATERIAL PROCUREMENT TRACKER
      </h1>
      <div className="flex items-center space-x-4">
        {/* MODIFIED: Single dynamic theme toggle button */}
        <button
          onClick={handleThemeToggleClick}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title={iconTitle}
        >
          {currentIcon}
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