import Image from "next/image";
import Link from "next/link";
import { useAppContext } from "@/context/Context";

const Logo = ({ display }) => {
  const {
    isLightTheme,
  } = useAppContext();
  return (
    <>
    <Image width={110} height={250} src={ isLightTheme ? "/images/logo/logo-dark-half.gif" : "/images/logo/logo.gif"}></Image>
    </>
  );
};

export default Logo;
