import React, { useEffect } from "react";

import sal from "sal.js";
import Image from "next/image";

import DocImg from "../../public/images/icons/document-file.png";

import EmailGeneratorData from "../../data/dashboard.json";
import Reaction from "../Common/Reaction";
import TopBar from "../Common/TopBar";

const EmailGenerator = () => {
  useEffect(() => {
    sal();
  }, []);
  return (
    <>
      <TopBar
        padding={true}
        barImg={DocImg}
        title="Create a talking avatar for this script:"
        wdt={14}
        htd={18}
      />
      {EmailGeneratorData &&
        EmailGeneratorData.emailGenerator.map((data, index) => (
          <div
            className="chat-box-list pt--0 pt--0"
            id="chatContainer"
            key={index}
          >
            <div className="chat-box author-speech">
              <div className="inner">
                <div className="chat-section">
                  <div className="author">
                    <Image
                      className="w-100"
                      width={40}
                      height={40}
                      src={data.author}
                      alt="Author"
                    />
                  </div>
                  <div className="chat-content">
                    <h6 className="title">{data.title}</h6>
                    <p>{data.desc}</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`chat-box ai-speech ${
                data.isBorder ? "chat-border-bottom" : ""
              }`}
            >
              {data.content.map((innerData, innerIndex) => (
                <div className="inner" key={innerIndex}>
                  <div className="chat-section">
                    <div className="author">
                      <Image
                        src={innerData.aiImg}
                        width={40}
                        height={40}
                        alt="Loader Images"
                      />
                    </div>
                    <div className="chat-content">
                      <h6 className="title">
                        ब्रह्मांड AI <span className="rainbow-badge-card">Bot</span>
                      </h6>
                      <p className="mb--20">{innerData.subjext}</p>
                      <p className="mb--20">{innerData.dear}</p>
                      <p className="mb--20">{innerData.desc}</p>
                      <p className="mb--20">{innerData.desc2}</p>
                      <p className="mb--20">{innerData.desc3}</p>
                      <p className="mb--20">{innerData.desc4}</p>
                      <p className="mb--10">{innerData.wish}</p>
                      <p className="mb--20">{innerData.name}</p>
                      <Reaction />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  );
};

export default EmailGenerator;
