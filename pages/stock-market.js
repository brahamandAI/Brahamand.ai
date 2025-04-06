import React from "react";
import PageHead from "./Head";
import Context from "@/context/Context";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import LeftDashboardSidebar from "@/components/Header/LeftDashboardSidebar";
import StockMarket from "@/components/StockMarket";
import Link from "next/link";
import { Home } from 'react-feather';

const StockMarketPage = () => {
  return (
    <>
      <PageHead title="Stock Market - AI Tools" />

      <main className="page-wrapper rbt-dashboard-page">
        <Context>
          <div className="rbt-panel-wrapper">
            <HeaderDashboard display="d-none" />
            <PopupMobileMenu />
            <LeftDashboardSidebar />

            <div className="rbt-main-content">
              <div className="rbt-daynamic-page-content">
                <div className="rbt-dashboard-content bg-color-white">
                  <div className="content-page pb--20">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="title">Stock Market</h3>
                      <Link href="/" className="btn" style={{
                        background: 'linear-gradient(45deg, #3F51B5, #5677fd)',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 10px rgba(63, 81, 181, 0.2)',
                        fontWeight: '500'
                      }}>
                        <Home size={16} /> Home
                      </Link>
                    </div>
                    <StockMarket />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Context>
      </main>
    </>
  );
};

export default StockMarketPage; 