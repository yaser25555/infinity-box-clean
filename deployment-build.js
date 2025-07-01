#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const execAsync = promisify(exec);

console.log('🏗️  بدء عملية البناء للنشر...');

async function buildAndPrepare() {
  try {
    // 1. بناء الواجهة الأمامية
    console.log('📦 بناء الواجهة الأمامية...');
    await execAsync('npx vite build');
    console.log('✅ تم بناء الواجهة الأمامية');
    
    // 2. إنشاء مجلد dist
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    
    // 3. نسخ كل الملفات المطلوبة
    console.log('📋 نسخ الملفات...');
    await execAsync('cp -r server dist/');
    await execAsync('cp -r shared dist/');
    await execAsync('cp tsconfig.json dist/');
    await execAsync('cp drizzle.config.ts dist/');
    
    // 4. إنشاء ملف البداية البسيط
    const startFile = `#!/usr/bin/env node
// نقطة البداية للإنتاج
process.env.NODE_ENV = 'production';
import('./server/index.js');
`;
    
    writeFileSync('dist/index.js', startFile);
    
    // 5. إنشاء package.json للإنتاج
    const productionPackage = {
      "name": "infinity-box",
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "start": "tsx server/index.ts"
      },
      "dependencies": {
        "@neondatabase/serverless": "^0.9.0",
        "pg": "^8.11.3",
        "drizzle-orm": "^0.29.1",
        "drizzle-zod": "^0.5.1",
        "express": "^4.18.2",
        "ws": "^8.16.0",
        "cors": "^2.8.5",
        "bcryptjs": "^2.4.3",
        "jsonwebtoken": "^9.0.2",
        "memoizee": "^0.4.17",
        "zod": "^3.22.4",
        "tsx": "^4.6.2"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));
    
    console.log('✅ تم إعداد ملفات الإنتاج');
    console.log('📁 مجلد الإخراج: dist/');
    console.log('🚀 للتشغيل: cd dist && npm install && npm start');
    
  } catch (error) {
    console.error('❌ فشلت عملية البناء:', error);
    process.exit(1);
  }
}

buildAndPrepare();