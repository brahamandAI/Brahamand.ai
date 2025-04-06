import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

const GoogleAuthHandler = () => {
  const router = useRouter();
  const { loginUser } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      localStorage.setItem("token", token);
      loginUser(token);
      router.push("/"); // Redirect to home after login
    }
  }, [router, loginUser]);

  return <p>Logging in...</p>;
};

export default GoogleAuthHandler;
