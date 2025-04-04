import React from "react";
import Context from "@/context/Context";
import PageHead from "@/pages/Head";

import HeaderTop from "@/components/Header/HeaderTop/HeaderTop";
import Header from "@/components/Header/Header";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import Footer from "@/components/Footers/Footer";
import Copyright from "@/components/Footers/Copyright";
import Breadcrumb from "@/components/Common/Breadcrumb";
import BackToTop from "@/pages/backToTop";
import SingleBlog from "@/components/BlogDetails/BlogDetails";

const BlogDetailsPage = () => {
  return (
    <>
      <PageHead title="Blog Details" />

      <main className="page-wrapper">
        <Context>
          <HeaderTop />
          <Header
            headerTransparent="header-transparent"
            headerSticky="header-sticky"
            btnClass="rainbow-gradient-btn"
          />
          <PopupMobileMenu />
          <Breadcrumb title="Blog Details" text="Blog Details" />

          <SingleBlog />

          <BackToTop />
          <Footer />
          <Copyright />
        </Context>
      </main>
    </>
  );
};

export default BlogDetailsPage;
