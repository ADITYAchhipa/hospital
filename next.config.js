const fs = require('fs');
const path = require('path');

try {
  const destDir = path.join(__dirname, 'public');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const dest = path.join(destDir, 'logo.png');
  
  // Try local logo.png first, then fall back to ../image.png
  const localLogo = path.join(__dirname, 'logo.png');
  const parentImage = path.join(__dirname, '../image.png');
  
  if (fs.existsSync(localLogo)) {
    fs.copyFileSync(localLogo, dest);
    console.log('✅ Successfully copied root logo.png to public/logo.png');
  } else if (fs.existsSync(parentImage)) {
    fs.copyFileSync(parentImage, dest);
    console.log('✅ Successfully copied parent image.png to public/logo.png');
  } else {
    console.warn('⚠️ No source logo/image found');
  }
} catch (err) {
  console.error('❌ Failed to copy logo:', err);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
