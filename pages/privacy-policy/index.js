import React from "react";
import PageHead from "../Head";
import Context from "@/context/Context";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import LeftDashboardSidebar from "@/components/Header/LeftDashboardSidebar";
import PrivacyPolicy from "@/components/PrivacyPolicy/PrivacyPolicy";

const TermsPolicyPage = () => {
  return (
    <>
      <PageHead title="Privacy Policy" />

      <main className="page-wrapper rbt-dashboard-page">
        <Context>
          <div className="rbt-panel-wrapper">
            <HeaderDashboard display="d-none" />
            <PopupMobileMenu />
            <LeftDashboardSidebar />

            <PrivacyPolicy />
          </div>
        </Context>
      </main>
    </>
  );
};

export default TermsPolicyPage;
