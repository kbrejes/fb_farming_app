/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      'webdriverio',
      'appium',
      '@wdio/appium-service',
      'undici'
    ]
  },
  webpack: (config, { isServer }) => {
    // На стороне клиента игнорируем проблемные модули, 
    // так как они нужны только на сервере
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
        url: false,
        assert: false,
        undici: false
      };
    }

    // Игнорируем модули для автоматизации, так как они используются только на сервере
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        'webdriver',
        'webdriverio',
        'appium',
        '@wdio/appium-service'
      ];
    }

    return config;
  }
}

module.exports = nextConfig 