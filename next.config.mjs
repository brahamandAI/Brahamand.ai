/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'brahamand.ai'],
    minimumCacheTTL: 60,
  },
  serverRuntimeConfig: {
    api: {
      bodyParser: false, // Disables body parsing, required for file uploads
      responseLimit: '10mb', // Increase response size limit for PDF analysis
    },
  },
  env: {
    // Make OPENAI_API_KEY available to the client
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

export default nextConfig;
