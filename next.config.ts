/** @type {import('next').NextConfig} */
const nextConfig = {
  // 绑定到所有网络接口
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
};

export default nextConfig;
