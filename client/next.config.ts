import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Минимальный self-contained сервер для Docker-образа
  output: "standalone",
};

export default nextConfig;
