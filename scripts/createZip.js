import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Function to get the next zip file number
function getNextZipNumber() {
  const files = fs.readdirSync(projectRoot);
  const zipFiles = files.filter(file => file.match(/^ecommerce_backend_\d+\.zip$/));
  
  if (zipFiles.length === 0) {
    return 1;
  }
  
  const numbers = zipFiles.map(file => {
    const match = file.match(/^ecommerce_backend_(\d+)\.zip$/);
    return match ? parseInt(match[1]) : 0;
  });
  
  return Math.max(...numbers) + 1;
}

// Create zip file
function createZip() {
  const zipNumber = getNextZipNumber();
  const outputPath = path.join(projectRoot, `ecommerce_backend_${zipNumber}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', () => {
    console.log(`✅ Archive created: ecommerce_backend_${zipNumber}.zip`);
    console.log(`📦 Total bytes: ${archive.pointer()}`);
    console.log(`📊 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  });

  output.on('end', () => {
    console.log('Data has been drained');
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('Warning:', err);
    } else {
      throw err;
    }
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Use glob patterns to include/exclude files
  archive.glob('**/*', {
    cwd: projectRoot,
    ignore: [
      'node_modules/**',           // Exclude node_modules
      'database.sqlite',           // Exclude database file
      'ecommerce_backend_*.zip',   // Exclude previous zip files
      '*.zip'                      // Exclude any other zip files
    ],
    dot: true                      // Include files starting with .
  });

  console.log(`🔄 Creating ecommerce_backend_${zipNumber}.zip...`);
  archive.finalize();
}

// Run the script
createZip();
