import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      }
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    if (dev) {
      if (process.env.DISABLE_HMR === 'true') {
        // HMR fully disabled to prevent flickering during agent edits.
        config.watchOptions = { ignored: /.*/ };
      } else {
        // Ignore Windows system files at drive root that cause EINVAL lstat
        // errors ("Watchpack Error: invalid argument, lstat 'C:\pagefile.sys'")
        // alongside the usual heavy build artefact dirs.
        config.watchOptions = {
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/.next/**',
            'pagefile.sys',
            'hiberfil.sys',
            'swapfile.sys',
            'System Volume Information/**',
          ],
        };
      }
    }
    return config;
  },
};

export default nextConfig;
