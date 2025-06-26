import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useLayout } from '../context/LayoutContext';
import { ChevronsLeft, Menu } from 'lucide-react'; // NEW: Import Menu for mobile toggle
import clsx from 'clsx';

const MainLayout = () => {
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false); // NEW: State for mobile sidebar

  return (
    // MODIFIED: Updated background to be theme-responsive.
    // Added relative positioning for the fixed sidebar and overlay on mobile.
    <div className="relative h-screen bg-white dark:bg-gray-900 flex flex-col lg:grid lg:grid-cols-[auto_1fr]">
      {/* Mobile Header with Hamburger Menu */}
      <div className="lg:hidden bg-white dark:bg-gray-800 shadow-md h-16 flex items-center px-4 justify-between flex-shrink-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          Material Tracker
        </h1>
        {/* Placeholder for header elements that might appear on mobile */}
        <div></div>
      </div>

      {/* Sidebar - Mobile: Fixed and full-height overlay, Desktop: Part of grid */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isSidebarCollapsed ? "lg:w-15" : "lg:w-64", // Collapsed width on desktop
          "bg-gray-800 dark:bg-gray-900 text-white flex-shrink-0 w-64 md:w-72" // Default width for mobile when open
        )}
      >
        <Sidebar onClose={() => setIsMobileSidebarOpen(false)} /> {/* Pass onClose to sidebar */}
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Collapse Button - Only visible on larger screens now */}
      <div
        className={clsx(
          'absolute top-[15%] -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out z-30 -translate-x-1/2 bg-white dark:bg-gray-800 opacity-90',
          'hidden sm:flex', // MODIFIED: Hide on smallest screens, show on sm and up
          isSidebarCollapsed ? 'left-[60px]' : 'left-[256px]', // Adjusted for desktop sidebar width
          'glow',
        )}
      >
        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Expand Menu' : 'Collapse Menu'}
          className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500 "
        >
          <ChevronsLeft
            size={20}
            className={clsx(
              'transition-transform duration-300 ease-in-out',
              isSidebarCollapsed && 'rotate-180',
            )}
          />
        </button>
      </div>
    </div>
  );
};

export default MainLayout;
