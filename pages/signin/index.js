import React from "react";
import PageHead from "../Head";

import SignIn from "@/components/sign/signIn";
import Context from "@/context/Context";

const SigninPage = () => {
  return (
    <>
      <PageHead title="Sign In" />
      <Context>
        <SignIn />
      </Context>
    </>
  );
};

export default SigninPage;
