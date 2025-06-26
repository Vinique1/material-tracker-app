import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useLayout } from '../context/LayoutContext';
import {
  Box,
  Building,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Download,
  Upload,
  CheckCircle,
  MinusCircle,
  AlertCircle,
  Scale,
  X, // NEW: Import X icon for close button
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ onClose }) => { // NEW: Accept onClose prop
  const { appMetadata } = useAuth();
  const { isSidebarCollapsed } = useLayout();
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [suppliersOpen, setSuppliersOpen] = useState(false);

  const linkClass =
    'flex items-center p-3 rounded-lg text-gray-300 hover:bg-blue-700 hover:text-white transition-colors w-full';
  const activeLinkClass = 'bg-blue-700 text-white';
  // MODIFIED: Adjusted childLinkClass to ensure proper spacing on mobile
  const childLinkClass = `flex items-center py-2 px-3 text-sm rounded-md hover:text-white transition-colors ${
    isSidebarCollapsed ? 'justify-center' : 'ml-4' // Adjusted ml-6 to ml-4 for tighter mobile spacing
  }`;

  return (
    <div
      className={clsx(
        'flex flex-col bg-gray-800 dark:bg-gray-900 text-white h-full transition-all duration-300 ease-in-out overflow-y-auto', // MODIFIED: Removed overflow-x-hidden from here, added overflow-y-auto
        // Width is handled by MainLayout's fixed/absolute positioning on mobile and grid on desktop
        "w-full" // Sidebar now takes full width of its parent on mobile
      )}
    >
      {/* MODIFIED: Header with close button for mobile */}
      <div
        className={clsx(
          'flex items-center h-20 border-b border-gray-700 flex-shrink-0',
          isSidebarCollapsed ? 'justify-center' : 'px-4 justify-between',
        )}
      >
        <div className="flex items-center">
          <img
            src="/Steve Logo.png"
            alt="Logo"
            className="h-10 w-10 flex-shrink-0"
          />
          {!isSidebarCollapsed && (
            <span className="ml-2 font-bold text-xl whitespace-nowrap">
              Steve Integrated
            </span>
          )}
        </div>
        {/* Close button for mobile */}
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-2 rounded-full">
          <X size={24} />
        </button>
      </div>

      <nav className={clsx('flex-1 px-4 py-4 space-y-1', isSidebarCollapsed ? 'sm:border-r sm:border-r-gray-700' : '')}> {/* MODIFIED: Applied border-r only on sm and up when collapsed */}
        <div>
          <button
            onClick={() =>
              !isSidebarCollapsed && setDashboardOpen(!dashboardOpen)
            }
            className={`${linkClass} ${
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title="Dashboard"
          >
            <div className="flex items-center">
              <LayoutDashboard size={20} className="flex-shrink-0" />
              {!isSidebarCollapsed && <span className="ml-4">Dashboard</span>}
            </div>
            {!isSidebarCollapsed &&
              (dashboardOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              ))}
          </button>
        </div>
        {!isSidebarCollapsed && dashboardOpen && (
          <div className="space-y-1 pl-4"> {/* Adjusted pl-6 to pl-4 for consistency */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${childLinkClass} ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`
              }
              end
              title="All Materials"
              onClick={onClose} // Close sidebar on mobile when navigating
            >
              All Materials
            </NavLink>{' '}
            {appMetadata.categories?.sort().map((cat) => (
              <NavLink
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                title={cat}
                className={({ isActive }) =>
                  `${childLinkClass} ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`
                }
                onClick={onClose} // Close sidebar on mobile when navigating
              >
                <Box size={16} className="mr-3 flex-shrink-0" />
                <span className="truncate">{cat}</span>
              </NavLink>
            ))}
          </div>
        )}

        <div>
          <button
            onClick={() =>
              !isSidebarCollapsed && setSuppliersOpen(!suppliersOpen)
            }
            className={`${linkClass} ${
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title="Suppliers"
          >
            <div className="flex items-center">
              <Building size={20} className="flex-shrink-0" />
              {!isSidebarCollapsed && <span className="ml-4">Suppliers</span>}
            </div>
            {!isSidebarCollapsed &&
              (suppliersOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              ))}
          </button>
        </div>
        {!isSidebarCollapsed && suppliersOpen && (
          <div className="space-y-1 pl-4"> {/* Adjusted pl-6 to pl-4 for consistency */}
            {appMetadata.suppliers?.sort().map((sup) => (
              <NavLink
                key={sup}
                to={`/supplier/${encodeURIComponent(sup)}`}
                title={sup}
                className={({ isActive }) =>
                  `${childLinkClass} ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`
                }
                onClick={onClose} // Close sidebar on mobile when navigating
              >
                <span className="truncate">{sup}</span>
              </NavLink>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-gray-700/50 mt-2 space-y-1">
          <NavLink
            to="/delivery-log"
            title="Delivery Log"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ''} ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`
            }
            onClick={onClose} // Close sidebar on mobile when navigating
          >
            <Download size={20} className="flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-4">Delivery Log</span>}
          </NavLink>
          <NavLink
            to="/issuance-log"
            title="Issuance Log"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ''} ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`
            }
            onClick={onClose} // Close sidebar on mobile when navigating
          >
            <Upload size={20} className="flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-4">Issuance Log</span>}
          </NavLink>
        </div>

        <div className="pt-2 border-t border-gray-700/50 mt-2 space-y-1">
          <NavLink
            to="/balanced-materials"
            title="Balanced Materials"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ''} ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`
            }
            onClick={onClose} // Close sidebar on mobile when navigating
          >
            <Scale size={20} className="flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="ml-4">Balanced Materials</span>
            )}
          </NavLink>
          <NavLink
            to="/status/surplus"
            title="Surplus Materials"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ''} ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`
            }
            onClick={onClose} // Close sidebar on mobile when navigating
          >
            <CheckCircle size={20} className="flex-shrink-0 text-green-400" />
            {!isSidebarCollapsed && (
              <span className="ml-4">Surplus Materials</span>
            )}
          </NavLink>
          <NavLink
            to="/status/deficit"
            title="Deficit Materials"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ''} ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`
            }
            onClick={onClose} // Close sidebar on mobile when navigating
          >
            <AlertCircle size={20} className="flex-shrink-0 text-red-400" />
            {!isSidebarCollapsed && (
              <span className="ml-4">Deficit Materials</span>
            )}
          </NavLink>
          <NavLink
            to="/status/exact"
            title="Exact Materials"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ''} ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`
            }
            onClick={onClose} // Close sidebar on mobile when navigating
          >
            <MinusCircle size={20} className="flex-shrink-0 text-yellow-400" />
            {!isSidebarCollapsed && (
              <span className="ml-4">Exact Materials</span>
            )}
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
