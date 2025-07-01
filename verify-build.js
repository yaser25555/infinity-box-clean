#!/usr/bin/env node

import { existsSync, statSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying build output...');

const requiredFiles = [
  'dist/index.js',
  'dist/package.json',
  'dist/public/index.html',
  'dist/server/index.ts',
  'dist/shared/schema.ts'
];

const requiredDirs = [
  'dist/public',
  'dist/server',
  'dist/shared'
];

let allValid = true;

// Check required files
console.log('\n📄 Checking required files:');
for (const file of requiredFiles) {
  if (existsSync(file)) {
    const size = statSync(file).size;
    console.log(`✅ ${file} (${(size / 1024).toFixed(1)}KB)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allValid = false;
  }
}

// Check required directories
console.log('\n📁 Checking required directories:');
for (const dir of requiredDirs) {
  if (existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - MISSING`);
    allValid = false;
  }
}

// Verify dist/public has assets
console.log('\n🎨 Checking frontend assets:');
const assetsDir = 'dist/public/assets';
if (existsSync(assetsDir)) {
  console.log(`✅ Frontend assets directory exists`);
} else {
  console.log(`❌ Frontend assets directory missing`);
  allValid = false;
}

// Check for production package.json
console.log('\n📦 Verifying production configuration:');
try {
  const pkgPath = 'dist/package.json';
  if (existsSync(pkgPath)) {
    console.log('✅ Production package.json exists');
    console.log('✅ Ready for deployment');
  }
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
  allValid = false;
}

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 BUILD VERIFICATION PASSED');
  console.log('📦 Ready for deployment!');
  console.log('📁 Publish directory: dist/public');
  console.log('🚀 Start command: node dist/index.js');
  console.log('🌐 Frontend assets in: dist/public/');
  console.log('⚙️  Server files in: dist/server/');
} else {
  console.log('❌ BUILD VERIFICATION FAILED');
  console.log('⚠️  Some required files or directories are missing');
  process.exit(1);
}