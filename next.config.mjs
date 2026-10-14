/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: false,
  // IP Wi-Fi của máy phát triển (thiết bị khác cùng mạng dùng địa chỉ này).
  // 172.21.240.1 là card WSL ảo mà Next hiển thị ở dòng "Network".
  allowedDevOrigins: ["10.161.129.79", "172.21.240.1"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
