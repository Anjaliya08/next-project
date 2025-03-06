import { NextConfig } from 'next';
import dotenv from 'dotenv';

dotenv.config();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
};

export default nextConfig;
