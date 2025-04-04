import React, { useEffect, useState } from "react";
import Context from "@/context/Context";
import PageHead from "../Head";
import { ToastContainer } from "react-toastify";
import BackToTop from "../backToTop";

const HomePage = () => {
  const [messages, setMessages] = useState([]);
  
  return (
    <>
      <ToastContainer />
      <PageHead title="Text Generator" />
      <main className="page-wrapper rbt-dashboard-page">
        <div className="rbt-panel-wrapper">
          <Context>
            <div className="rbt-main-content">
              <div className="rbt-daynamic-page-content">
                <div className="rbt-dashboard-content">
                  <div className="content-page">
                    <div className="chat-box-section">
                      {messages.length === 0 ? (
                        <div>Welcome to the chat</div>
                      ) : (
                        messages.map((data, index) => (
                          <div key={`message-${data.id}`}>
                            Message content
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Context>
        </div>
      </main>
      <BackToTop />
    </>
  );
};

export default HomePage; 