#!/bin/bash

echo "🏗️  Starting production build..."

# Build the client directly with vite
echo "📦 Building client..."
npx vite build

# Run the custom build script
echo "🔨 Building server..."
node build.js

# Verify the build
if [ -f dist/index.js ]; then
    echo "✅ Build successful! dist/index.js exists"
    echo "📁 Contents of dist directory:"
    ls -la dist/
else
    echo "❌ Build failed! dist/index.js not found"
    exit 1
fi

echo "🎉 Production build completed!"