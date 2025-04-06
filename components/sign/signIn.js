import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

import logo from "../../public/images/logo/logo.png";
import logoDark from "../../public/images/light/logo/logo-dark.png";
import google from "../../public/images/sign-up/google.png";
import facebook from "../../public/images/sign-up/facebook.png";
import DarkSwitch from "../Header/dark-switch";
import { useAppContext } from "@/context/Context";

const SignIn = () => {
  const { isLightTheme, toggleTheme } = useAppContext();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post("/api/login", formData);
  
      if (response.status == 200) {
        toast.success("Login successful");
      
        const { token, userId } = response.data;
      
        // ✅ Save token in LocalStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("isLoggedIn", "1");
      
        // ✅ Set token in Cookies (Client-Side)
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
       else {
        toast.error(response.data.message || "Login failed!");
      }
    } catch (error) {
      toast.error("Invalid email or password. Please try again.");
    }
  
    setLoading(false);
  };
  
  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google`;
    const googleAuthURL = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;

    window.location.href = googleAuthURL;
  };

  return (
    <>
      <DarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} />
      <ToastContainer />
      <main className="page-wrapper">
        <div className="signup-area">
          <div className="wrapper">
            <div className="row">
              <div className="col-lg-12 bg-color-blackest left-wrapper">
                <div className="sign-up-box">
                  <div className="signup-box-top mb-1">
                    <Link href="/">
                      <Image
                        width={193}
                        height={50}
                        src={
                          isLightTheme
                            ? "/images/logo/logo-dark.gif"
                            : "/images/logo/logo-white.gif"
                        }
                      ></Image>
                    </Link>
                    {/* <Link href="/">
                      <Image
                        src={isLightTheme ? logo : logoDark}
                        width={193}
                        height={50}
                        alt="sign-up logo"
                      />
                    </Link> */}
                  </div>
                  <div className="signup-box-bottom">
                    <div className="signup-box-content">
                      <div className="social-btn-grp justify-content-center">
                        <a
                          className="btn-default btn-border"
                          onClick={handleGoogleLogin}
                        >
                          <span className="icon-left">
                            <Image
                              src={google}
                              width={18}
                              height={18}
                              alt="Google Icon"
                            />
                          </span>
                          Login with Google
                        </a>
                        {/* <a className="btn-default btn-border" href="#">
                          <span className="icon-left">
                            <Image
                              src={facebook}
                              width={18}
                              height={18}
                              alt="Facebook Icon"
                            />
                          </span>
                          Login with Facebook
                        </a> */}
                      </div>
                      <div className="text-social-area">
                        <hr />
                        <span>Or continue with</span>
                        <hr />
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="input-section mail-section">
                          <div className="icon">
                            <i className="fa-sharp fa-regular fa-envelope"></i>
                          </div>
                          <input
                            type="email"
                            name="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="input-section password-section">
                          <div className="icon">
                            <i className="fa-sharp fa-regular fa-lock"></i>
                          </div>
                          <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="forget-text">
                          <a className="btn-read-more" href="#">
                            <span>Forgot password</span>
                          </a>
                        </div>
                        <button
                          type="submit"
                          className="btn-default"
                          disabled={loading}
                        >
                          {loading ? "Signing In..." : "Sign In"}
                        </button>
                      </form>
                    </div>
                    <div className="signup-box-footer">
                      <div className="bottom-text">
                        Don't have an account?{" "}
                        <a className="btn-read-more ml--5" href="/signup">
                          <span>Sign Up</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link className="close-button" href="/">
            <i className="fa-sharp fa-regular fa-x"></i>
          </Link>
        </div>
      </main>
    </>
  );
};

export default SignIn;
