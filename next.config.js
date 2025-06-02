/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
  },
  images: {
    domains: ['s3.tradingview.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s3.tradingview.com https://charting-library.tradingview-widget.com; object-src 'none';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 