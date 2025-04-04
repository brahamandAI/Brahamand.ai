import Link from "next/link";
import React from "react";

const Copyright = () => {
  return (
    <>
      <div className="copyright-area copyright-style-one">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12 col-md-12 col-sm-12 col-12">
              <div className="text-center">
              ब्रह्मांड AI can make mistakes. Check important info.
              </div>
            </div>
            {/* <div className="col-lg-6 col-md-4 col-sm-12 col-12">
              <div className="copyright-right text-center text-lg-end">
                <p className="copyright-text">
                  Copyright © 2025{" "}
                  <Link
                    href="#"
                    className="btn-read-more"
                  >
                    <span>
                    ब्रह्मांड AI 
                    </span>
                  </Link>
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Copyright;
