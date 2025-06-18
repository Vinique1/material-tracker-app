import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Box, Building, ChevronDown, ChevronRight, Grip, LayoutDashboard, LogOut, Download, Upload } from 'lucide-react'; // MODIFIED: Added new icons

const Sidebar = () => {
  const { appMetadata, currentUser } = useAuth();
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [suppliersOpen, setSuppliersOpen] = useState(false);
  
  const baseLinkClass = "w-full flex justify-between items-center p-2 text-gray-300 rounded-md hover:bg-blue-700 hover:text-white transition-colors";
  const childLinkClass = "flex items-center py-2 px-4 ml-6 text-sm text-gray-400 rounded-md hover:bg-blue-700 hover:text-white transition-colors";
  const activeLinkClass = "bg-blue-700 text-white";
  
  const iconMap = {
      Pipes: <Grip size={16} className="mr-3 flex-shrink-0" />,
      // Add other category icons here if desired
  };

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white h-full">
      <div className="flex items-center justify-center h-20 border-b border-gray-700 px-4">
         <img src="/Steve Logo.png" alt="Logo" className="h-10 w-10 mr-3" />
        <h1 className="text-xl font-bold text-center">Steve Integrated</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <div>
          <button onClick={() => setCategoriesOpen(!categoriesOpen)} className={baseLinkClass}>
            <div className="flex items-center"><LayoutDashboard size={20} className="mr-3" /><span>All Items</span></div>
            {categoriesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {categoriesOpen && (
            <div className="mt-1">
                <NavLink to="/" className={({ isActive }) => `${childLinkClass} ${isActive ? activeLinkClass : ''}`} end>All Categories</NavLink>
                {appMetadata.categories?.sort().map(cat => (
                    <NavLink key={cat} to={`/category/${encodeURIComponent(cat)}`} className={({ isActive }) => `${childLinkClass} ${isActive ? activeLinkClass : ''}`}>
                      {iconMap[cat] || <Box size={16} className="mr-3 flex-shrink-0" />}
                      <span className="truncate">{cat}</span>
                    </NavLink>
                ))}
            </div>
          )}
        </div>
        <div>
            <button onClick={() => setSuppliersOpen(!suppliersOpen)} className={baseLinkClass}>
                <div className="flex items-center"><Building size={20} className="mr-3" /><span>Suppliers</span></div>
                {suppliersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {suppliersOpen && (
                 <div className="mt-1">
                    {appMetadata.suppliers?.sort().map(sup => (
                        <NavLink key={sup} to={`/supplier/${encodeURIComponent(sup)}`} className={({ isActive }) => `${childLinkClass} ${isActive ? activeLinkClass : ''}`}>
                             <ChevronRight size={16} className="mr-3 flex-shrink-0" />
                             <span className="truncate">{sup}</span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
        {/* NEW: Added Delivery and Issuance Log links */}
        <NavLink to="/delivery-log" className={({isActive}) => `flex items-center p-2 text-gray-300 rounded-md hover:bg-blue-700 hover:text-white transition-colors ${isActive ? activeLinkClass : ''}`}>
            <Download size={20} className="mr-3" />
            <span>Delivery Log</span>
        </NavLink>
        <NavLink to="/issuance-log" className={({isActive}) => `flex items-center p-2 text-gray-300 rounded-md hover:bg-blue-700 hover:text-white transition-colors ${isActive ? activeLinkClass : ''}`}>
            <Upload size={20} className="mr-3" />
            <span>Issuance Log</span>
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 truncate" title={currentUser?.email}>{currentUser?.email}</p>
          <button onClick={() => signOut(auth)} className="w-full mt-2 flex items-center justify-center p-2 bg-red-600 text-white rounded-md hover:bg-red-700">
             <LogOut size={16} className="mr-2"/>
             Sign Out
          </button>
      </div>
    </div>
  );
};

export default Sidebar;
