const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetFolders = [
  'Rocket_launches_from_icy_land_20261027031051_frames',
  'Camera_moves_through_icy_tunnel_20261027032841_frames',
  'Camera_moves_up_to_clouds_20261027224013_frames',
];

function getAllPngFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllPngFiles(fullPath));
    } else if (item.endsWith('.png')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function convertAll() {
  console.log('Scanning directories for PNG frames...');
  let allFiles = [];
  for (const folder of targetFolders) {
    const fullDir = path.resolve(folder);
    if (fs.existsSync(fullDir)) {
      allFiles = allFiles.concat(getAllPngFiles(fullDir));
    }
  }

  console.log(`Found ${allFiles.length} PNG frames to convert.`);
  let totalOriginal = 0;
  let totalCompressed = 0;
  let count = 0;

  // Process concurrently in chunks of 10 to utilize CPU cores without overloading memory
  const CHUNK_SIZE = 12;
  for (let i = 0; i < allFiles.length; i += CHUNK_SIZE) {
    const chunk = allFiles.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (file) => {
        const outPath = file.replace(/\.png$/i, '.webp');
        const origSize = fs.statSync(file).size;
        totalOriginal += origSize;

        await sharp(file)
          .webp({ quality: 84, effort: 4 })
          .toFile(outPath);

        const newSize = fs.statSync(outPath).size;
        totalCompressed += newSize;
        count++;
        if (count % 30 === 0 || count === allFiles.length) {
          console.log(`Converted ${count}/${allFiles.length} frames...`);
        }
      })
    );
  }

  console.log('Conversion Complete!');
  console.log(`Original Total: ${(totalOriginal / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Compressed Total: ${(totalCompressed / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total Reduction: ${((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}%`);
}

convertAll().catch(console.error);

