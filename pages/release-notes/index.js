import React from "react";
import PageHead from "../Head";
import Context from "@/context/Context";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import LeftDashboardSidebar from "@/components/Header/LeftDashboardSidebar";
import Release from "@/components/Release/Release";
import BackToTop from "../backToTop";

const ReleaseNotesPage = () => {
  return (
    <>
      <PageHead title="Release Notes" />

      <main className="page-wrapper rbt-dashboard-page">
        <Context>
          <div className="rbt-panel-wrapper">
            <HeaderDashboard display="d-none" />
            <PopupMobileMenu />
            <LeftDashboardSidebar />

            <Release />
          </div>
          <BackToTop />
        </Context>
      </main>
    </>
  );
};

export default ReleaseNotesPage;
