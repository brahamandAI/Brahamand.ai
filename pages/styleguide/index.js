import React from "react";
import Context from "@/context/Context";

import PageHead from "../Head";

import HeaderTop from "@/components/Header/HeaderTop/HeaderTop";
import Header from "@/components/Header/Header";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import StyleGuide from "@/components/StyleGuide/StyleGuide";
import Footer from "@/components/Footers/Footer";
import Copyright from "@/components/Footers/Copyright";
import Breadcrumb from "@/components/Common/Breadcrumb";

const StyleGuidepage = () => {
  return (
    <>
      <PageHead title="Style Guide" />

      <main className="page-wrapper">
        <Context>
          <HeaderTop />
          <Header
            headerTransparent="header-transparent"
            headerSticky="header-sticky"
            btnClass="rainbow-gradient-btn"
          />
          <PopupMobileMenu />
          <Breadcrumb title="Style Guide" text="Style Guide" />

          <StyleGuide />

          <Footer />
          <Copyright />
        </Context>
      </main>
    </>
  );
};

export default StyleGuidepage;
