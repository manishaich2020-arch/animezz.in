/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent pg (node-postgres) from being bundled for the browser
  experimental: {
    serverComponentsExternalPackages: ["pg", "pg-pool"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
