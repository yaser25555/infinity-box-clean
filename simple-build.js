#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

console.log('🏗️  Starting simple production build...');

async function buildClient() {
  console.log('📦 Building client...');
  try {
    await execAsync('npx vite build');
    console.log('✅ Client build completed');
  } catch (error) {
    console.error('❌ Client build failed:', error);
    throw error;
  }
}

async function setupProductionServer() {
  console.log('🖥️  Setting up production server...');
  try {
    // Create dist directory
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    
    // Copy server and shared directories
    await execAsync('cp -r server dist/');
    await execAsync('cp -r shared dist/');
    
    // Copy necessary config files
    await execAsync('cp tsconfig.json dist/');
    await execAsync('cp drizzle.config.ts dist/');
    
    // Create production entry point
    const productionEntry = `#!/usr/bin/env node
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { registerRoutes } from './server/routes.js';
import { setupVite, serveStatic } from './server/vite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the build output
app.use(express.static(join(__dirname, 'public')));

async function startServer() {
  try {
    // In production, serve the built client files
    if (process.env.NODE_ENV === 'production') {
      serveStatic(app);
    } else {
      const server = createServer(app);
      await setupVite(app, server);
    }
    
    // Register all routes
    const server = await registerRoutes(app);
    
    server.listen(port, '0.0.0.0', () => {
      console.log(\`🚀 Server running on port \${port}\`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
`;
    
    writeFileSync('dist/index.js', productionEntry);
    
    // Create production package.json
    const prodPackage = {
      "name": "infinity-box-production",
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "start": "tsx index.js"
      },
      "dependencies": {
        "@neondatabase/serverless": "^0.9.0",
        "@types/node": "^20.10.0",
        "pg": "^8.11.3",
        "drizzle-orm": "^0.29.1",
        "drizzle-zod": "^0.5.1",
        "express": "^4.18.2",
        "ws": "^8.16.0",
        "cors": "^2.8.5",
        "bcryptjs": "^2.4.3",
        "jsonwebtoken": "^9.0.2",
        "memoizee": "^0.4.17",
        "mongoose": "^7.6.3",
        "openid-client": "^6.6.1",
        "zod": "^3.22.4",
        "tsx": "^4.6.2",
        "typescript": "^5.3.3"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    console.log('✅ Production server setup completed');
  } catch (error) {
    console.error('❌ Server setup failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await buildClient();
    await setupProductionServer();
    
    console.log('🎉 Build completed successfully!');
    console.log('📁 Output directory: dist/');
    console.log('🚀 Start command: cd dist && npm install && npm start');
  } catch (error) {
    console.error('💥 Build failed:', error);
    process.exit(1);
  }
}

main();