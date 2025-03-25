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
  },
  // Принудительно используем порт 3000
  port: 3000,
  // Увеличиваем тайм-аут для более стабильной сборки
  staticPageGenerationTimeout: 180
}

module.exports = nextConfig 