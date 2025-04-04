import Head from "next/head";

const PageHead = ({ title }) => {
  return (
    <>
      <Head>
        <title>ब्रह्मांड AI</title>
        <meta name="description" content="Page Description" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="icon" href="/images/logo/logo-dark-half.gif" /> */}
      {/* Standard Favicon */}
  <link rel="icon" type="image/gif" href="/images/logo/logo-dark_cut.png" />

      </Head>
    </>
  );
};

export default PageHead;
