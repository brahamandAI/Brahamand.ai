import Image from "next/image";
import Link from "next/link";
import { useAppContext } from "@/context/Context";

const LogoCon = ({ display }) => {
  const {
    isLightTheme,
  } = useAppContext();
  return (
    <>
    <Image width={80} height={80} style={{width:'80px', maxWidth:'80px'}} src={ isLightTheme ? "/images/logo/logo-dark-half.gif" : "/images/logo/output-onlinegiftools.gif"}></Image>
    </>
  );
};

export default LogoCon;
