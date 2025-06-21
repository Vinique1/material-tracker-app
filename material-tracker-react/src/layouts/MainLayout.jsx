import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useLayout } from "../context/LayoutContext";
import { ChevronsLeft } from "lucide-react";
import clsx from "clsx";

const MainLayout = () => {
  const { isSidebarCollapsed, toggleSidebar } = useLayout();

  return (
    // MODIFIED: Updated background to be theme-responsive
    <div className="relative h-screen bg-white dark:bg-gray-900">
      <div
        className={`grid h-full transition-all duration-300 ${
          isSidebarCollapsed ? "grid-cols-[80px_1fr]" : "grid-cols-[256px_1fr]"
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* MODIFIED: Added -translate-x-1/2 to perfectly center the button on the border */}
      <div
        className={clsx(
          "absolute top-[15%] -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out z-30 -translate-x-1/2 bg-white dark:bg-gray-800 opacity-90",
          isSidebarCollapsed ? "left-[80px]" : "left-[256px]",
          "glow"
        )}
      >
        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
          className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500 "
        >
          <ChevronsLeft
            size={20}
            className={clsx(
              "transition-transform duration-300 ease-in-out",
              isSidebarCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>
    </div>
  );
};

export default MainLayout;
