import Image from "next/image";
import Link from "next/link";
import { useAppContext } from "@/context/Context";
import { useEffect, useRef } from "react";

import logo from "../../public/images/logo/logo.png";
import logoDark from "../../public/images/light/logo/logo-dark.png";
import avatar from "../../public/images/team/team-01sm.jpg";

import Nav from "./Nav";
import UserMenu from "./UserMenu";

const HeaderDashboard = ({ display }) => {
  const {
    mobile,
    setMobile,
    rightBar,
    setRightBar,
    activeMobileMenu,
    setActiveMobileMenu,
    setShouldCollapseLeftbar,
    setShouldCollapseRightbar,
    isLightTheme,
  } = useAppContext();
  
  const sidebarRef = useRef(null);

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setShouldCollapseLeftbar(true);
      setShouldCollapseRightbar(true);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleLeftSidebar = () => {
    setShouldCollapseLeftbar((prev) => !prev);
  };

  const handleToggleRightSidebar = () => {
    setShouldCollapseRightbar((prev) => !prev);
  };

  return (
    <>
      <header className="rbt-dashboard-header rainbow-header header-default header-left-align rbt-fluid-header">
        <div className="container-fluid position-relative">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-3 col-md-6 col-6">
              <div className="header-left d-flex">
                <div className="expand-btn-grp">
                  <button
                    className={`bg-solid-primary popup-dashboardleft-btn ${
                      mobile ? "" : "collapsed"
                    }`}
                    onClick={handleToggleLeftSidebar}
                  >
                    <i className="fa-sharp fa-regular fa-sidebar"></i>
                  </button>
                </div>
                <div className="logo">
                  <Link href="/">
                    <Image width={110} height={250} src={ isLightTheme ? "/images/logo/logo-dark.gif" : "/images/logo/logo-white.gif"}></Image>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6 d-none d-lg-block text-center">
              <nav className="mainmenu-nav d-none d-lg-block text-center">
                <Nav />
              </nav>
            </div>

            <div className="col-lg-3 col-md-6 col-6">
              <div className="header-right">
                <div className="mobile-menu-bar mr--10 ml--10 d-block d-lg-none">
                  <div className="hamberger">
                    <button
                      className="hamberger-button"
                      onClick={() => setActiveMobileMenu(!activeMobileMenu)}
                    >
                      <i className="feather-menu"></i>
                    </button>
                  </div>
                </div>

                <div className={`expand-btn-grp ${display}`}>
                  <button
                    className={`bg-solid-primary popup-dashboardright-btn ${
                      rightBar ? "" : "collapsed"
                    }`}
                    onClick={handleToggleRightSidebar}
                  >
                    <i className="fa-sharp fa-regular fa-sidebar-flip"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderDashboard;
