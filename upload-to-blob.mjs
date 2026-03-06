/**
 * Upload all local assets to Vercel Blob and output a URL map.
 * Run: BLOB_READ_WRITE_TOKEN=xxx node upload-to-blob.mjs
 *
 * After this runs, it writes blob-url-map.json with old path → blob URL.
 * Then run: node update-html-refs.mjs to rewrite all HTML files.
 */

import { put } from '@vercel/blob';
import { createReadStream, statSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('ERROR: Set BLOB_READ_WRITE_TOKEN environment variable first.');
  console.error('  export BLOB_READ_WRITE_TOKEN=your_token_here');
  process.exit(1);
}

// All assets referenced in the HTML files
const assets = [
  // brand_assets
  'brand_assets/Group 27.png',
  'brand_assets/Group 25.png',
  'brand_assets/Group 26.png',
  'brand_assets/Frame 16.png',
  'brand_assets/Frame 14.png',
  'brand_assets/Frame 11.png',
  'brand_assets/Frame 17.png',
  'brand_assets/Frame 30.png',
  'brand_assets/Frame 9 (1).png',
  'brand_assets/Group 18.png',
  'brand_assets/Brand Kit DarkNX.png',
  'brand_assets/IMG_0371.png',
  'brand_assets/istockphoto-2182250916-612x612.jpg',
  'brand_assets/Arctic.mp4',
  'brand_assets/Arctic 2.mp4',
  // brand_assets subfolders
  'brand_assets/Company Headshot/ebf31d9d8fb6d60b 1.png',
  'brand_assets/Company Headshot/Arman Headshot.png',
  // Video Files
  'Video Files/Power Substation.mp4',
  'Video Files/Google Data Center Module.mp4',
  'Video Files/Brownfield.mp4',
  'Video Files/Presenatation.mp4',
  'Video Files/Website Video.mp4',
  'Video Files/Greenfield 2.mp4',
  'Video Files/Sustainability.mp4',
  'Video Files/Manufacturing.mp4',
  'Video Files/350_Ton_York_2600_0011.jpg',
  'Video Files/Utility Transformer.png',
  'Video Files/Used-Modular-Data-Center-40-1024x768.webp',
];

const urlMap = {};

async function upload(localPath) {
  const fullPath = path.resolve(localPath);
  if (!existsSync(fullPath)) {
    console.warn(`  SKIP (not found): ${localPath}`);
    return;
  }

  const size = statSync(fullPath).size;
  const sizeMB = (size / 1024 / 1024).toFixed(1);
  process.stdout.write(`Uploading ${localPath} (${sizeMB} MB)... `);

  const stream = createReadStream(fullPath);
  const blobName = localPath; // preserve folder structure in blob

  const { url } = await put(blobName, stream, {
    access: 'public',
    token,
    contentType: guessMime(localPath),
  });

  urlMap[localPath] = url;
  console.log(`OK → ${url}`);
}

function guessMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return map[ext] || 'application/octet-stream';
}

console.log(`Uploading ${assets.length} assets to Vercel Blob...\n`);

for (const asset of assets) {
  await upload(asset);
}

writeFileSync('blob-url-map.json', JSON.stringify(urlMap, null, 2));
console.log(`\nDone! URL map saved to blob-url-map.json`);
console.log('Now run: node update-html-refs.mjs');
