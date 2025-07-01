#!/usr/bin/env node

// تشغيل الخادم مباشرة للإنتاج
import { spawn } from 'child_process';

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    NODE_ENV: 'production',
    PORT: process.env.PORT || '5000'
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// معالجة إشارات الإيقاف
process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
});

process.on('SIGHUP', () => {
  server.kill('SIGHUP');
});