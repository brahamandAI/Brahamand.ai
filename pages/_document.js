import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@100..900&family=Sora:wght@100..800&display=swap"
          rel="stylesheet"
        ></link>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js" />
        <script src="/pdf-worker-loader.js" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
