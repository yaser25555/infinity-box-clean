#!/usr/bin/env node

import { build } from 'esbuild';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🏗️  Starting build process...');

async function buildClient() {
  console.log('📦 Building client...');
  try {
    await execAsync('vite build');
    console.log('✅ Client build completed');
  } catch (error) {
    console.error('❌ Client build failed:', error);
    throw error;
  }
}

async function buildServer() {
  console.log('🖥️  Building server...');
  try {
    // Create dist directories
    await execAsync('mkdir -p dist');
    
    // Build the server using esbuild
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/index.js',
      packages: 'external',  // Mark all packages as external to avoid bundling issues
      sourcemap: false,
      minify: false,  // Disable minification to avoid issues
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      logLevel: 'info'
    });
    
    console.log('✅ Server build completed');
  } catch (error) {
    console.error('❌ Server build failed:', error);
    throw error;
  }
}

async function copySharedFiles() {
  console.log('📋 Copying shared files...');
  try {
    // Copy shared files to dist/server directory for proper imports
    await execAsync('mkdir -p dist/server');
    await execAsync('cp -r shared/ dist/');
    await execAsync('cp -r shared/ dist/server/');
    console.log('✅ Shared files copied');
  } catch (error) {
    console.error('❌ Failed to copy shared files:', error);
    throw error;
  }
}

async function createPackageJson() {
  console.log('📝 Creating production package.json...');
  try {
    const originalPkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const prodPkg = {
      name: originalPkg.name,
      version: originalPkg.version,
      type: 'module',
      scripts: {
        start: 'node index.js'
      },
      dependencies: {
        '@neondatabase/serverless': originalPkg.dependencies['@neondatabase/serverless'],
        'pg': originalPkg.dependencies['pg'],
        'drizzle-orm': originalPkg.dependencies['drizzle-orm'],
        'express': originalPkg.dependencies['express'],
        'ws': originalPkg.dependencies['ws'],
        'cors': originalPkg.dependencies['cors'],
        'bcryptjs': originalPkg.dependencies['bcryptjs'],
        'jsonwebtoken': originalPkg.dependencies['jsonwebtoken'],
        'memoizee': originalPkg.dependencies['memoizee'],
        'mongoose': originalPkg.dependencies['mongoose'],
        'openid-client': originalPkg.dependencies['openid-client'],
        'zod': originalPkg.dependencies['zod'],
        'drizzle-zod': originalPkg.dependencies['drizzle-zod']
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));
    console.log('✅ Production package.json created');
  } catch (error) {
    console.error('❌ Failed to create production package.json:', error);
    throw error;
  }
}

async function main() {
  try {
    await buildClient();
    await buildServer();
    await copySharedFiles();
    await createPackageJson();
    
    console.log('🎉 Build completed successfully!');
    console.log('📁 Output directory: dist/');
    console.log('🚀 Ready for deployment with: node dist/index.js');
  } catch (error) {
    console.error('💥 Build failed:', error);
    process.exit(1);
  }
}

main();