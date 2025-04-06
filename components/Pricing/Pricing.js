import React, { useEffect, useState } from "react";

import PricingData from "../../data/pricing.json";
import axios from "axios";

const Pricing = ({ start, end, parentClass, isBadge, gap }) => {
  const [sectionStates, setSectionStates] = useState({
    Premium: true,
    Enterprise: true,
  });
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // Create an order on the server
    const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            amount: 100, // Example amount (in INR)
            currency: "INR",
        }),
    });

    const data = await response.json();

    if (!data.id) {
        alert("Failed to create order");
        setLoading(false);
        return;
    }

    // Configure Razorpay options
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "ब्रह्मांड AI",
        description: "ब्रह्मांड AI",
        order_id: data.id,
        handler: function (response) {
            alert("Payment successful!");
            console.log(response);
            // Handle successful payment here (e.g., update database)
        },
        prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9999999999",
        },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    setLoading(false);
};
  // const handlePayment = async () => {
  //   try {
  //     // Step 1: Create Order
  //     const { data } = await axios.post("/api/payment", {
  //       amount: 500, // Amount in INR
  //       currency: "INR",
  //     });

  //     // Step 2: Open Razorpay Checkout
  //     const options = {
  //       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_Public, // Public key
  //       amount: data.amount,
  //       currency: data.currency,
  //       name: "Your Company Name",
  //       description: "Payment for Order",
  //       order_id: data.id, // Order ID from backend
  //       handler: function (response) {
  //         alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
  //       },
  //       prefill: {
  //         name: "John Doe",
  //         email: "john@example.com",
  //         contact: "9999999999",
  //       },
  //       theme: {
  //         color: "#3399cc",
  //       },
  //     };

  //     const rzp = new window.Razorpay(options);
  //     rzp.open();
  //   } catch (error) {
  //     console.error("Payment Error:", error);
  //   }
  // };
  
  

  const toggleSection = (subTitle) => {
    setSectionStates((prevState) => ({
      ...prevState,
      [subTitle]: !prevState[subTitle],
    }));
  };


  return (
    <>
      <div
        className="tab-content p-0 bg-transparent border-0 border bg-light"
        id="nav-tabContent"
      >
        {PricingData &&
          PricingData.pricing.map((data, index) => (
            <div
              className={`tab-pane fade ${data.isSelect ? "active show" : ""}`}
              id={data.priceId}
              role="tabpanel"
              aria-labelledby={`${data.priceId}-tab`}
              key={index}
            >
              <div className={`row row--15 ${gap}`}>
                {data.priceBody
                  .slice(start, end)
                  .map((innerData, innerIndex) => (
                    <div className={parentClass} key={innerIndex}>
                      <div
                        className={`rainbow-pricing style-ब्रह्मांड AI ${
                          innerData.isSelect ? "active" : ""
                        }`}
                      >
                        <div className="pricing-table-inner">
                          <div className="pricing-top">
                            <div className="pricing-header">
                              <div className="icon">
                                <i className={innerData.iconClass}></i>
                              </div>
                              <h4
                                className={`title color-var-${innerData.classNum}`}
                              >
                                {innerData.subTitle}
                              </h4>
                              <p className="subtitle">{innerData.title}</p>
                              <div className="pricing">
                                <span className="price-text">
                                  {innerData.price}
                                </span>
                                <span className="text">
                                  {innerData.priceFor}
                                </span>
                              </div>
                            </div>
                            <div className="pricing-body">
                              <div
                                className={`features-section has-show-more ${
                                  !sectionStates[innerData.subTitle]
                                    ? "active"
                                    : ""
                                }`}
                              >
                                <h6>{innerData.text}</h6>
                                <ul className="list-style--1 has-show-more-inner-content">
                                  {innerData.listItem.map((list, i) => (
                                    <li key={i}>
                                      <i className="fa-regular fa-circle-check"></i>
                                      {list.text}
                                    </li>
                                  ))}
                                </ul>
                                {innerData.isShow ? (
                                  <div
                                    className={`rbt-show-more-btn ${
                                      !sectionStates[innerData.subTitle]
                                        ? "active"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      toggleSection(innerData.subTitle)
                                    }
                                  >
                                    Show More
                                  </div>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="pricing-footer">
                            <button onClick={handlePayment} disabled={loading}>
                              {loading ? "Processing..." : "Pay Now"}
                            </button>
                            <a
                              className={`btn-default ${
                                innerData.isSelect
                                  ? "color-blacked"
                                  : "btn-border"
                              }`}
                              href="#"
                            >
                              Get Started
                            </a>
                            <p className="bottom-text">{innerData.limited}</p>
                          </div>
                        </div>
                        {innerData.isSelect && isBadge ? (
                          <div className="feature-badge">Best Offer</div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Pricing;
