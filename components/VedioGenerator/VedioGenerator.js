import React, { useEffect } from "react";
import Image from "next/image";
import "venobox/dist/venobox.min.css";
import sal from "sal.js";

import imgPhoto from "../../public/images/icons/vedio-icon.png";

import ImageGeneratorData from "../../data/dashboard.json";
import Reaction from "../Common/Reaction";
import TopBar from "../Common/TopBar";

const VideoGenerator = () => {
  useEffect(() => {
    sal();

    import("venobox/dist/venobox.min.js").then((venobox) => {
      new venobox.default({
        selector: ".popup-video",
        maxWidth: window.innerWidth >= 992 ? "70%" : "100%",
      });
    });
  }, []);
  return (
    <>
      <TopBar
        padding={true}
        barImg={imgPhoto}
        title="Create a talking avatar for this script:"
        wdt={24}
        htd={24}
      />
      {ImageGeneratorData &&
        ImageGeneratorData.videoGenerator.map((data, index) => (
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
                      <p className="mb--10">{data.desc}</p>
                      <p className={`${data.mb ? "mb--20" : ""}`}>
                        {data.desc2}
                      </p>
                      {data.img ? (
                        <div className="img-box img-box-frame">
                          <Image
                            className="w-100 radius"
                            src={data.img}
                            width={696}
                            height={471}
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
                      <div className="chat-section generate-section">
                        <div className="author">
                          <i className="fa-sharp fa-solid fa-check"></i>
                        </div>
                        <div className="chat-content">
                          <h6 className="title color-text-off mb--0">
                            {innerData.scan}
                          </h6>
                        </div>
                      </div>
                      <div className="chat-section generate-section">
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
                          <p className="mb--20">{innerData.desc}</p>
                          <div className="image-caption mb--20">
                            <h5 className="caption-title theme-gradient">
                              {innerData.caption}
                            </h5>
                          </div>
                          <div className="video-popup icon-center frame-image gradient-secondary frame-image-author mb--20 p-0">
                            <Image
                              className="w-100 radius"
                              src={innerData.videoImg}
                              width={696}
                              height={471}
                              alt="Image Generation"
                            />
                            <div className="video-icon">
                              <a
                                className="btn-default rounded-player popup-video border bg-white-dropshadow"
                                href="https://www.youtube.com/watch?v=ikEdN260zRg"
                                data-vbtype="video"
                              >
                                <span>
                                  <i className="fa-duotone fa-play"></i>
                                </span>
                              </a>
                            </div>
                            <button className="download-btn btn-default btn-small bg-solid-primary">
                              <i className="fa-sharp fa-regular fa-download"></i>
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

export default VideoGenerator;
