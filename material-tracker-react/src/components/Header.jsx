import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // MODIFIED: Import useTheme from new context
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { LogOut } from "lucide-react"; // MODIFIED: Removed Sun, Moon as they're not needed with select

const Header = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme(); // MODIFIED: Use theme and toggleTheme from new context

  const handleSignOut = () => signOut(auth);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
        GBARAN GBCD MATERIAL PROCUREMENT TRACKER
      </h1>
      <div className="flex items-center space-x-4">
        {/* NEW: Theme Select Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="theme-select" className="sr-only">
            Select theme
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => toggleTheme(e.target.value)}
            className="p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="text-right hidden sm:block">
          <p
            className="text-sm font-medium text-gray-800 dark:text-gray-200"
            title={currentUser?.email}
          >
            {currentUser?.email}
          </p>
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
