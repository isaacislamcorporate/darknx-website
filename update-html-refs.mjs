/**
 * Rewrite all HTML files to replace local asset paths with Vercel Blob URLs.
 * Run AFTER upload-to-blob.mjs has created blob-url-map.json.
 *
 * Usage: node update-html-refs.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';

const urlMap = JSON.parse(readFileSync('blob-url-map.json', 'utf8'));

const htmlFiles = readdirSync('.').filter(f => f.endsWith('.html'));

let totalReplacements = 0;

for (const file of htmlFiles) {
  let content = readFileSync(file, 'utf8');
  let replacements = 0;

  for (const [localPath, blobUrl] of Object.entries(urlMap)) {
    if (content.includes(blobUrl)) continue;

    const variants = [
      localPath,
      localPath.replace(/ /g, '%20'),
    ];

    for (const variant of variants) {
      const before = content;
      content = content.replaceAll(variant, blobUrl);
      if (content !== before) {
        replacements++;
        break; // stop after first successful variant to avoid double-replace
      }
    }
  }

  if (replacements > 0) {
    writeFileSync(file, content, 'utf8');
    console.log(`${file}: ${replacements} replacement(s)`);
    totalReplacements += replacements;
  }
}

console.log(`\nDone. ${totalReplacements} total replacements across ${htmlFiles.length} HTML files.`);
