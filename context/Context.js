import React, { createContext, useContext, useState, useEffect } from "react";

export const CreateContext = createContext();

export const useAppContext = () => useContext(CreateContext);

const Context = ({ children }) => {
  const [mobile, setMobile] = useState(true);
  const [rightBar, setRightBar] = useState(true);
  const [toggleTop, setToggle] = useState(true);
  const [toggleAuth, setToggleAuth] = useState(true);
  const [showItem, setShowItem] = useState(true);
  const [activeMobileMenu, setActiveMobileMenu] = useState(true);
  const [isLightTheme, setLightTheme] = useState(false);
  const [shouldCollapseLeftbar, setShouldCollapseLeftbar] = useState(true);
  const [shouldCollapseRightbar, setShouldCollapseRightbar] = useState(true);

  const checkScreenSize = () => {
    if (window.innerWidth < 1600) {
      setMobile(false);
      setRightBar(false);
    } else {
      setMobile(true);
      setRightBar(true);
    }
  };
  
  useEffect(() => {
    const themeType = localStorage.getItem("ब्रह्मांड AI-theme");

    if (themeType === "dark") {
      document.body.classList.add("active-dark-mode");
      localStorage.setItem("ब्रह्मांड AI-theme", "light");
    } else {
      setLightTheme(false); // Set light mode
      document.body.classList.add("active-dark-mode");
    }
  }, []);

  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add("active-dark-mode");
      localStorage.setItem("ब्रह्मांड AI-theme", "light");
    } else {
      document.body.classList.add("active-dark-mode");
      localStorage.setItem("ब्रह्मांड AI-theme", "dark");
    }
  }, [isLightTheme]);

  // ===========> Switcher Function START
  const toggleTheme = () => {
    setLightTheme((prevTheme) => !prevTheme);
  };
  // ===========> Switcher Function END

  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  return (
    <CreateContext.Provider
      value={{
        mobile,
        setMobile,
        showItem,
        setShowItem,
        activeMobileMenu,
        setActiveMobileMenu,
        toggleTop,
        setToggle,
        toggleAuth,
        setToggleAuth,
        rightBar,
        setRightBar,
        shouldCollapseLeftbar,
        setShouldCollapseLeftbar,
        shouldCollapseRightbar,
        setShouldCollapseRightbar,
        isLightTheme,
        setLightTheme,
        toggleTheme,
      }}
    >
      {children}
    </CreateContext.Provider>
  );
};

export default Context;

