import React, { useState } from "react";
import Image from "next/image";

import darkImg from "../../public/images/switcher-img/light.png";
import lightImg from "../../public/images/switcher-img/light.png";
import flag from "../../public/images/icons/en-us.png";
import flag2 from "../../public/images/icons/fr.png";

import UserNav from "../Common/UserNav";
import { useAppContext } from "@/context/Context";

const Appearance = () => {
  const { isLightTheme, toggleTheme } = useAppContext();

  return (
    <>
      <div className="rbt-main-content mb-0">
        <div className="rbt-daynamic-page-content center-width">
          <div className="rbt-dashboard-content">
            <UserNav title="Appearance" />
            <div className="content-page pb--50">
              <div className="chat-box-list">
                <div className="single-settings-box">
                  <h4 className="title">Appearance</h4>
                  <div className="switcher-btn-grp">
                    <button
                      className={`dark-switcher ${
                        isLightTheme ? "active" : ""
                      }`}
                      onClick={toggleTheme}
                    >
                      <Image
                        src={darkImg}
                        width={200}
                        height={150}
                        alt="Switcher Image"
                      />
                      <span className="text">Dark Mode</span>
                    </button>
                    <button
                      className={`light-switcher ${
                        !isLightTheme ? "active" : ""
                      }`}
                      onClick={toggleTheme}
                    >
                      <Image
                        src={lightImg}
                        width={200}
                        height={150}
                        alt="Switcher Image"
                      />
                      <span className="text">Light Mode</span>
                    </button>
                  </div>
                </div>

                <div className="single-settings-box">
                  <h4 className="title">Languages</h4>
                  <div className="select-area">
                    <h6 className="text">System Language</h6>
                    <div className="rbt-modern-select bg-transparent height-45">
                      <select>
                        <option>English</option>
                        <option>Spanish</option>
                        <option>Italic</option>
                        <option>French</option>
                      </select>
                    </div>
                  </div>
                  <div className="select-area mt--20">
                    <h6 className="text">Generate Language</h6>

                    <div className="rbt-modern-select bg-transparent height-45">
                      <select>
                        <option>French</option>
                        <option>English</option>
                        <option>Spanish</option>
                        <option>Italic</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Appearance;
