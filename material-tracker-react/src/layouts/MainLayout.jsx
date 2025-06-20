import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useLayout } from '../context/LayoutContext';

const MainLayout = () => {
  const { isSidebarCollapsed } = useLayout();

  return (
    <div className={`grid h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300 ${isSidebarCollapsed ? 'grid-cols-[80px_1fr]' : 'grid-cols-[256px_1fr]'}`}>
      <Sidebar />
      <div className="flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
