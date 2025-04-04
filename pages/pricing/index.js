import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Sal from "sal.js";

import PageHead from "../Head";
import PricingData from "../../data/pricing.json";

import bgShape from "../../public/images/bg/bg-shape-two.png";

import Context from "@/context/Context";
import HeaderTop from "@/components/Header/HeaderTop/HeaderTop";
import Header from "@/components/Header/Header";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import Footer from "@/components/Footers/Footer";
import Copyright from "@/components/Footers/Copyright";
import Breadcrumb from "@/components/Common/Breadcrumb";
import BackToTop from "../backToTop";
import Pricing from "@/components/Pricing/Pricing";
import BrandTwo from "@/components/Brands/Brand-Two";
import Compare from "@/components/Pricing/Compare";
import TestimonialTwo from "@/components/Testimonials/TestimonialTwo";
import AccordionItem from "@/components/Accordion/AccordionItem";
import CtaTwo from "@/components/CallToActions/Cta-Two";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import Headers from "@/components/Header/Header";

const PricingPage = () => {
  useEffect(() => {
    Sal();
  }, []);
  return (
    <>
      <PageHead title="Pricing" />

      <main className="page-wrapper">
        <Context>
          {/* <HeaderTop /> */}
          <HeaderDashboard
            headerTransparent="header-transparent"
            headerSticky="header-sticky"
            btnClass="rainbow-gradient-btn"
          />
            {/* <HeaderDashboard display="" /> */}
          <PopupMobileMenu />
          <Breadcrumb title="Pricing Plans For Everyone" text="Pricing" />

          <div className="rainbow-pricing-area rainbow-section-gap">
            <div className="container-fluid">
              <div className="wrapper rainbow-section-gap">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <div
                        className="section-title text-center"
                        data-sal="slide-up"
                        data-sal-duration="400"
                        data-sal-delay="150"
                      >
                        <h4 className="subtitle">
                          <span className="theme-gradient">Pricing</span>
                        </h4>
                        <h2 className="title w-600 mb--20">
                          Commence Content Journey with AI
                        </h2>
                        <p className="description b1">
                          Collaborate with AI to generate content that
                          resonates.
                        </p>
                      </div>
                      <nav className="ब्रह्मांड AI-tab">
                        <div
                          className="tab-btn-grp nav nav-tabs mb-3 text-center justify-content-center"
                          id="nav-tab"
                          role="tablist"
                        >
                          {PricingData &&
                            PricingData.pricing.map((data, index) => (
                              <button
                                className={`nav-link ${
                                  data.isSelect ? "active" : ""
                                }`}
                                id={`${data.priceId}-tab`}
                                data-bs-toggle="tab"
                                data-bs-target={`#${data.priceId}`}
                                type="button"
                                role="tab"
                                aria-controls={data.priceId}
                                aria-selected="false"
                                key={index}
                              >
                                {data.priceType}{" "}
                                {data.discount ? (
                                  <span className="rainbow-badge-card badge-border">
                                    -{data.discount}%
                                  </span>
                                ) : (
                                  ""
                                )}
                              </button>
                            ))}
                        </div>
                      </nav>
                    </div>
                  </div>

                  <Pricing
                    parentClass="col-xl-4 col-lg-6 col-md-6 col-12 mt--30"
                    start={0}
                    end={3}
                    isHeading={false}
                    isBadge={false}
                  />
                </div>
              </div>
            </div>

            {/* <div className="rainbow-brand-area rainbow-section-gap">
              <div className="container">
                <div className="row">
                  <div className="col-lg-12">
                    <div
                      className="section-title rating-title text-center sal-animate"
                      data-sal="slide-up"
                      data-sal-duration="700"
                      data-sal-delay="100"
                    >
                      <div className="rating">
                        <a href="#rating">
                          <i className="fa-sharp fa-solid fa-star"></i>
                        </a>
                        <a href="#rating">
                          <i className="fa-sharp fa-solid fa-star"></i>
                        </a>
                        <a href="#rating">
                          <i className="fa-sharp fa-solid fa-star"></i>
                        </a>
                        <a href="#rating">
                          <i className="fa-sharp fa-solid fa-star"></i>
                        </a>
                        <a href="#rating">
                          <i className="fa-sharp fa-solid fa-star"></i>
                        </a>
                      </div>
                      <p className="subtitle mb--0">
                        Based on 20,000+ reviews on
                      </p>
                    </div>
                  </div>
                </div>
                <BrandTwo />
              </div>

              <div className="bg-shape-left">
                <Image src={bgShape} width={688} height={1055} alt="Bg shape" />
              </div>
            </div> */}

            <div className="rainbow-pricing-detailed-area rainbow-section-gap">
              <div className="container">
                <Compare
                  titleType={true}
                  postion="center"
                  title="Compare plans & features"
                  subTitle="Price Compare"
                />
              </div>
            </div>

            {/* <div className="rainbow-testimonial-area rainbow-section-gap">
              <div className="container">
                <TestimonialTwo />
              </div>
            </div> */}

            {/* <div className="rainbow-accordion-area rainbow-section-gap">
              <div className="container">
                <div className="row justify-content-between">
                  <div className="col-lg-12 col-xl-4 col-12">
                    <div className="split-inner">
                      <h2
                        className="title sal-animate"
                        data-sal="slide-up"
                        data-sal-duration="400"
                        data-sal-delay="200"
                      >
                        Any question's? we have answers!
                      </h2>
                      <p
                        className="description sal-animate"
                        data-sal="slide-up"
                        data-sal-duration="400"
                        data-sal-delay="300"
                      >
                        Don’t find your answer here? just send us a message for
                        any query.
                      </p>
                      <div
                        className="contact-button mt--35 sal-animate"
                        data-sal="slide-up"
                        data-sal-duration="400"
                        data-sal-delay="400"
                      >
                        <Link
                          className="rainbow-gradient-btn without-shape"
                          target="_blank"
                          href="/contact"
                        >
                          <span>Contact us</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 col-xl-7 col-12">
                    <AccordionItem parentClass="rainbow-accordion-02" />
                  </div>
                </div>
              </div>
            </div> */}

            {/* <div className="rainbow-cta-area rainbow-section-gap rainbow-section-gapBottom-big">
              <div className="container">
                <CtaTwo />
              </div>
            </div> */}
          </div>

          <BackToTop />
          {/* <Footer /> */}
          <Copyright />
        </Context>
      </main>
    </>
  );
};

export default PricingPage;
