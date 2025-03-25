/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Отключаем предупреждения о гидратации
  suppressHydrationWarning: true,
  // Другие настройки
  experimental: {
    // Отключаем автоматически добавляемые классы в режиме разработки
    optimizeCss: false,
  },
}

module.exports = nextConfig 