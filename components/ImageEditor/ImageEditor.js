import React, { useEffect } from "react";

import sal from "sal.js";
import Image from "next/image";

import imgPhoto from "../../public/images/icons/photo-icon.png";

import ImageGeneratorData from "../../data/dashboard.json";
import Reaction from "../Common/Reaction";
import TopBar from "../Common/TopBar";

const ImageEditor = () => {
  useEffect(() => {
    sal();
  }, []);
  return (
    <>
      <TopBar
        padding={true}
        barImg={imgPhoto}
        title="Website roadmap title write me"
        wdt={24}
        htd={24}
      />
      {ImageGeneratorData &&
        ImageGeneratorData.imageEditor.map((data, index) => (
          <div
            className="chat-box-list pt--0 pb--25"
            id="chatContainer"
            key={index}
          >
            {data.author ? (
              <div
                className={`chat-box author-speech ${
                  data.isBorder ? "chat-border-bottom" : ""
                }`}
              >
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
                      <p className={`${data.mb ? "mb--20" : ""}`}>
                        {data.desc}
                      </p>
                      {data.img ? (
                        <div className="img-box img-box-frame">
                          <Image
                            className="w-50 radius"
                            src={data.img}
                            width={348}
                            height={230}
                            alt="Image Generation"
                          />
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {data.content ? (
              <div
                className={`chat-box ai-speech ${
                  data.isBorder ? "chat-border-bottom" : ""
                }`}
              >
                {data.content &&
                  data.content.map((innerData, innerIndex) => (
                    <div className="inner" key={innerIndex}>
                      <div className="chat-section">
                        <div className="author">
                          <i className="fa-sharp fa-solid fa-check"></i>
                        </div>
                        <div className="chat-content">
                          <h6 className="title color-text-off mb--0">
                            {innerData.scan}
                          </h6>
                        </div>
                      </div>
                      <div className="chat-section">
                        <div className="author">
                          <Image
                            src={innerData.img}
                            width={40}
                            height={40}
                            alt="Loader Images"
                          />
                        </div>
                        <div className="chat-content">
                          <h6 className="title color-text-off mb--0">
                            {innerData.text}
                          </h6>
                        </div>
                      </div>
                      <div className="chat-section generate-details-section">
                        <div className="author">
                          <Image
                            className="w-100"
                            src={innerData.aiImg}
                            width={40}
                            height={40}
                            alt="ब्रह्मांड AI"
                          />
                        </div>
                        <div className="chat-content">
                          <h6 className="title mb--20">{innerData.title}</h6>
                          <div className="img-box img-box-frame mb--20">
                            <Image
                              className="w-100 radius"
                              src={innerData.generateImg}
                              width={696}
                              height={462}
                              alt="Image Generation"
                            />
                            <button
                              className={`download-btn btn-default btn-small ${
                                innerData.isBorder
                                  ? "bg-solid-primary"
                                  : "btn-border"
                              }`}
                            >
                              <i className="feather-download"></i>
                              <span>Download</span>
                            </button>
                          </div>
                          <Reaction />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              ""
            )}
          </div>
        ))}
    </>
  );
};

export default ImageEditor;
