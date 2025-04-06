import React from "react";
import PageHead from "../Head";
import Context from "@/context/Context";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import LeftDashboardSidebar from "@/components/Header/LeftDashboardSidebar";
import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";

const ProfileDetailsPage = () => {
  return (
    <>
      <PageHead title="Profile Details" />

      <main className="page-wrapper rbt-dashboard-page">
        <Context>
          <div className="rbt-panel-wrapper">
            <HeaderDashboard display="d-none" />
            <PopupMobileMenu />
            <LeftDashboardSidebar />

            <ProfileDetails />
          </div>
        </Context>
      </main>
    </>
  );
};

export default ProfileDetailsPage;
