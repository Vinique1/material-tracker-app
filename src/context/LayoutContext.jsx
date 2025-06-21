import React, { createContext, useContext, useState, useEffect } from "react";

const LayoutContext = createContext();
export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <LayoutContext.Provider
      value={{
        isSidebarCollapsed,
        toggleSidebar,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
