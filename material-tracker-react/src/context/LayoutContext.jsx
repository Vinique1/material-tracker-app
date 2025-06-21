import React, { createContext, useContext, useState } from "react"; // MODIFIED: Removed useEffect

const LayoutContext = createContext();
export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // MODIFIED: Removed theme state and useEffect

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const value = {
    isSidebarCollapsed,
    toggleSidebar,
    // MODIFIED: Removed theme and setTheme from value
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};
