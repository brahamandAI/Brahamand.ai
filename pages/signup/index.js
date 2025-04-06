import React from "react";
import PageHead from "../Head";

import Context from "@/context/Context";
import SignUp from "@/components/sign/signUp";

const SignupPage = () => {
  return (
    <>
      <PageHead title="Sign Up" />
      <Context>
        <SignUp />
      </Context>
    </>
  );
};

export default SignupPage;
