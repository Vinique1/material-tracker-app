import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
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
} from "lucide-react";
import clsx from "clsx";

const Sidebar = () => {
  const { appMetadata } = useAuth();
  const { isSidebarCollapsed } = useLayout();
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [suppliersOpen, setSuppliersOpen] = useState(false);

  const linkClass =
    "flex items-center p-3 rounded-lg text-black font-medium dark:text-gray-300 hover:bg-blue-700 hover:text-white  transition-colors w-full";
  const activeLinkClass = "bg-blue-700 text-black dark:text-white";
  const childLinkClass = `flex items-center py-2 px-3 text-sm rounded-md hover:text-[#2b7fff] dark:hover:text-white transition-colors ${
    isSidebarCollapsed ? "justify-center" : "ml-6"
  }`;

  return (
    <div
      className={clsx(
        "flex flex-col bg-gray-800 dark:bg-gray-900 text-white h-full overflow-x-hidden", // MODIFIED: Added dark background
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* MODIFIED: Header logic simplified to guarantee logo visibility and centering */}
      <div
        className={clsx(
          "flex items-center h-20 border-b border-gray-700 flex-shrink-0",
          isSidebarCollapsed ? "justify-center" : "px-4 justify-start"
        )}
      >
        <img
          src="/Steve Logo.png"
          alt="Logo"
          className="h-10 w-10 flex-shrink-0"
        />
        {!isSidebarCollapsed && (
          <span className="ml-2 font-bold text-xl whitespace-nowrap text-[#2b7fff] dark:text-white">
            Steve Integrated
          </span>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div>
          <button
            onClick={() =>
              !isSidebarCollapsed && setDashboardOpen(!dashboardOpen)
            }
            className={`${linkClass} ${
              isSidebarCollapsed ? "justify-center" : "justify-between"
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
          <div className="space-y-1 pl-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${childLinkClass} ml-0 ${
                  isActive ? "text-white" : "text-gray-400"
                }`
              }
              end
              title="All Materials"
            >
              All Materials
            </NavLink>{" "}
            {/* MODIFIED: Added dark text */}
            {appMetadata.categories?.sort().map((cat) => (
              <NavLink
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                title={cat}
                className={({ isActive }) =>
                  `${childLinkClass} ml-0 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`
                }
              >
                {" "}
                {/* MODIFIED: Added dark text */}
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
              isSidebarCollapsed ? "justify-center" : "justify-between"
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
          <div className="space-y-1 pl-6">
            {appMetadata.suppliers?.sort().map((sup) => (
              <NavLink
                key={sup}
                to={`/supplier/${encodeURIComponent(sup)}`}
                title={sup}
                className={({ isActive }) =>
                  `${childLinkClass} ml-0 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`
                }
              >
                {" "}
                {/* MODIFIED: Added dark text */}
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
              `${linkClass} ${isActive ? activeLinkClass : ""} ${
                isSidebarCollapsed ? "justify-center" : ""
              }`
            }
          >
            <Download size={20} className="flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-4">Delivery Log</span>}
          </NavLink>
          <NavLink
            to="/issuance-log"
            title="Issuance Log"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ""} ${
                isSidebarCollapsed ? "justify-center" : ""
              }`
            }
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
              `${linkClass} ${isActive ? activeLinkClass : ""} ${
                isSidebarCollapsed ? "justify-center" : ""
              }`
            }
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
              `${linkClass} ${isActive ? activeLinkClass : ""} ${
                isSidebarCollapsed ? "justify-center" : ""
              }`
            }
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
              `${linkClass} ${isActive ? activeLinkClass : ""} ${
                isSidebarCollapsed ? "justify-center" : ""
              }`
            }
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
              `${linkClass} ${isActive ? activeLinkClass : ""} ${
                isSidebarCollapsed ? "justify-center" : ""
              }`
            }
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
