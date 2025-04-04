import React from "react";
import PageHead from "../Head";
import Context from "@/context/Context";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import LeftDashboardSidebar from "@/components/Header/LeftDashboardSidebar";
import Applications from "@/components/Application/Application";

const ApplicationPage = () => {
  return (
    <>
      <PageHead title="Applications" />

      <main className="page-wrapper rbt-dashboard-page">
        <Context>
          <div className="rbt-panel-wrapper">
            <HeaderDashboard display="d-none" />

            <PopupMobileMenu />
            <LeftDashboardSidebar />

            <Applications />
          </div>
        </Context>
      </main>
    </>
  );
};

export default ApplicationPage;
