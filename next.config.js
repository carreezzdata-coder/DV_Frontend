const nextConfig = {
  distDir: '.next',
  reactStrictMode: true,
  
  images: {
    unoptimized: true,
    domains: ['api.dailyvaibe.com', 'dailyvaibe.com', 'admin.dailyvaibe.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dailyvaibe.com',
      },
      {
        protocol: 'https',
        hostname: 'dailyvaibe.com',
      },
      {
        protocol: 'https',
        hostname: '**.dailyvaibe.com',
      },
    ],
  },
  
  env: {
    PROJECT_ID: 'dailyvaibe-app',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.dailyvaibe.com',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://dailyvaibe.com',
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  devIndicators: {
    position: 'bottom-right',
  },
  
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://api.dailyvaibe.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization, Cookie, X-CSRF-Token, Accept, Accept-Version'
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'https://api.dailyvaibe.com';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
