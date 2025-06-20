import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { Box, Building, ChevronDown, ChevronRight, LayoutDashboard, Download, Upload, CheckCircle, MinusCircle, AlertCircle, Scale } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const { appMetadata } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const [dashboardOpen, setDashboardOpen] = useState(true);

  const linkClass = "flex items-center p-3 rounded-lg text-gray-300 hover:bg-blue-700 hover:text-white transition-colors w-full";
  const activeLinkClass = "bg-blue-700 text-white";
  const childLinkClass = `flex items-center py-2 px-3 text-sm rounded-md hover:text-white transition-colors ${isSidebarCollapsed ? 'justify-center' : 'ml-6'}`;

  return (
    <div className={clsx(
      "flex flex-col bg-gray-800 text-white h-full transition-all duration-300 ease-in-out overflow-x-hidden",
      isSidebarCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* MODIFIED: Header layout is simplified to ensure the button is always visible */}
      <div className={clsx(
        "flex items-center h-20 border-b border-gray-700 flex-shrink-0",
        isSidebarCollapsed ? "justify-center px-2" : "px-4"
      )}>
        <button 
          onClick={toggleSidebar} 
          title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"} 
          className="flex items-center p-2 rounded-lg text-gray-300 hover:bg-blue-700 hover:text-white"
        >
            <img src="/Steve Logo.png" alt="Logo" className="h-10 w-10 flex-shrink-0" />
            {/* The company name is now inside the button and conditionally rendered */}
            {!isSidebarCollapsed && (
                <span className="ml-2 font-bold text-xl whitespace-nowrap">
                    Steve Integrated
                </span>
            )}
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <div>
          <button 
            onClick={() => !isSidebarCollapsed && setDashboardOpen(!dashboardOpen)} 
            className={`${linkClass} ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`} 
            title="Dashboard"
          >
            <div className="flex items-center"><LayoutDashboard size={20} className="flex-shrink-0" />{!isSidebarCollapsed && <span className="ml-4">Dashboard</span>}</div>
            {!isSidebarCollapsed && (dashboardOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </button>
        </div>
        {!isSidebarCollapsed && dashboardOpen && (
            <div className="space-y-1">
                <NavLink to="/" className={({ isActive }) => `${childLinkClass} ${isActive ? 'text-white' : 'text-gray-400'}`} end title="All Materials">All Materials</NavLink>
                {appMetadata.categories?.sort().map(cat => (
                    <NavLink key={cat} to={`/category/${encodeURIComponent(cat)}`} title={cat} className={({ isActive }) => `${childLinkClass} ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      <Box size={16} className="mr-3 flex-shrink-0" /><span className="truncate">{cat}</span>
                    </NavLink>
                ))}
            </div>
        )}

        <NavLink to="/delivery-log" title="Delivery Log" className={({isActive}) => `${linkClass} ${isActive ? activeLinkClass : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <Download size={20} className="flex-shrink-0"/>{!isSidebarCollapsed && <span className="ml-4">Delivery Log</span>}
        </NavLink>
        <NavLink to="/issuance-log" title="Issuance Log" className={({isActive}) => `${linkClass} ${isActive ? activeLinkClass : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <Upload size={20} className="flex-shrink-0"/>{!isSidebarCollapsed && <span className="ml-4">Issuance Log</span>}
        </NavLink>

        <div className="pt-2 border-t border-gray-700/50 mt-4">
            <NavLink to="/balanced-materials" title="Balanced Materials" className={({isActive}) => `${linkClass} ${isActive ? activeLinkClass : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <Scale size={20} className="flex-shrink-0"/>{!isSidebarCollapsed && <span className="ml-4">Balanced Materials</span>}
            </NavLink>
            <NavLink to="/status/surplus" title="Surplus Materials" className={({isActive}) => `${linkClass} ${isActive ? activeLinkClass : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <CheckCircle size={20} className="flex-shrink-0 text-green-400"/>{!isSidebarCollapsed && <span className="ml-4">Surplus Materials</span>}
            </NavLink>
             <NavLink to="/status/deficit" title="Deficit Materials" className={({isActive}) => `${linkClass} ${isActive ? activeLinkClass : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <AlertCircle size={20} className="flex-shrink-0 text-red-400"/>{!isSidebarCollapsed && <span className="ml-4">Deficit Materials</span>}
            </NavLink>
             <NavLink to="/status/exact" title="Exact Materials" className={({isActive}) => `${linkClass} ${isActive ? activeLinkClass : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <MinusCircle size={20} className="flex-shrink-0 text-yellow-400"/>{!isSidebarCollapsed && <span className="ml-4">Exact Materials</span>}
            </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
