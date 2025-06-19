/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
  },
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'localhost',
      'example.com',
      'picsum.photos',
      'source.unsplash.com',
      'www.xe.com',
      'flagpedia.net',
      'flagcdn.com',
      'countryflags.io',
      'cdn.jsdelivr.net',
      'raw.githubusercontent.com',
      'github.com',
      'assets.coingecko.com',
      'coin-images.coingecko.com',
      'media.giphy.com',
      'giphy.com',
      'assets.website-files.com',
      'webflow.com',
      'uploads-ssl.webflow.com',
      'i.imgur.com',
      'imgur.com',
      'images.pexels.com',
      'www.pexels.com',
      'cdn.pixabay.com',
      'pixabay.com',
      'freeimages.com',
      'www.freeimages.com'
    ]
  }
};

module.exports = nextConfig; 