import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import LeftDashboardSidebar from "@/components/Header/LeftDashboardSidebar";
import PDFAnalysis from '../components/PDFAnalysis';
import NewsFeed from '../components/NewsFeed';
import WeatherWidget from '../components/WeatherWidget';
import StockMarket from '../components/StockMarket';

const TABS = [
  { id: 'pdf', name: 'PDF Analysis', icon: '📄' },
  { id: 'news', name: 'News Updates', icon: '📰' },
  { id: 'weather', name: 'Weather Forecast', icon: '🌤️' },
  { id: 'stock', name: 'Stock Market', icon: '📈' },
];

export default function ToolsPage() {
  const router = useRouter();
  const { tab } = router.query;
  const [activeTab, setActiveTab] = useState('pdf');
  
  useEffect(() => {
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.push({
      pathname: router.pathname,
      query: { tab: tabId },
    }, undefined, { shallow: true });
  };

  const getPageTitle = () => {
    const currentTab = TABS.find(t => t.id === activeTab);
    return currentTab ? currentTab.name : 'AI Tools';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pdf':
        return <PDFAnalysis />;
      case 'news':
        return <NewsFeed />;
      case 'weather':
        return <WeatherWidget />;
      case 'stock':
        return <StockMarket />;
      default:
        return <PDFAnalysis />;
    }
  };

  return (
    <>
      <Head>
        <title>{getPageTitle()} - AI Tools</title>
        <meta name="description" content={`Use our AI-powered ${getPageTitle()} tool`} />
      </Head>
      <HeaderDashboard display="d-block" />
      <PopupMobileMenu />
      <div className="dashboard-experince-wrapper">
        <div className="dashboard-experience">
          <div className="rbt-dashboard-content bg-color-white">
            <LeftDashboardSidebar />
            <div className="rbt-dashboard-content-wrapper">
              <div className="tools-dashboard-container">
                <div className="rbt-dashboard-title mb--30">
                  <h4 className="title">{getPageTitle()}</h4>
                  <p className="description">
                    Access all our AI-powered tools in one place. Switch between different features using the tabs below.
                  </p>
                </div>
                
                {/* Tabs Navigation */}
                <div className="tools-tabs-container mb--30">
                  <div className="tools-tabs">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                      >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-name">{tab.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tab Content */}
                <div className="tools-content-container">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tools-dashboard-container {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .tools-tabs-container {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .tools-tabs {
          display: flex;
          flex-wrap: wrap;
          border-bottom: 1px solid #eee;
        }
        .tab-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          justify-content: center;
        }
        .tab-button:hover {
          background-color: #f9fafb;
          color: #3F51B5;
        }
        .tab-button.active {
          border-bottom-color: #3F51B5;
          color: #3F51B5;
          background-color: #EBF4FF;
        }
        .tab-icon {
          font-size: 20px;
        }
        .tools-content-container {
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        @media (max-width: 768px) {
          .tab-button {
            padding: 12px;
          }
          .tab-name {
            display: none;
          }
          .tab-icon {
            font-size: 24px;
          }
        }
        .mb--30 {
          margin-bottom: 30px;
        }
      `}</style>
    </>
  );
} 