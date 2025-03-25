/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: false,
  },
  webpack: (config) => {
    // Игнорируем проблемные модули
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false,
      'webdriverio': false,
      'appium': false,
      '@wdio/appium-service': false
    };
    return config;
  }
}

module.exports = nextConfig 