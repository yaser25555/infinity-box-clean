# دليل النشر الشامل لـ INFINITY BOX

## قائمة الملفات المطلوبة للرفع على GitHub:

### 1. ملفات الإعداد الأساسية:
```
package.json ← محدث بجميع dependencies
netlify.toml ← إعدادات النشر
.nvmrc ← إصدار Node.js
tsconfig.json ← إعدادات TypeScript
vite.config.ts ← إعدادات Vite
tailwind.config.ts ← إعدادات Tailwind
postcss.config.js ← إعدادات PostCSS
components.json ← إعدادات shadcn/ui
```

### 2. مجلد client (Frontend):
```
client/
├── index.html
├── public/
├── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── components/
    │   ├── AdminDashboard.tsx
    │   ├── AuthPage.tsx
    │   ├── ChatMessage.tsx
    │   ├── EmojiPicker.tsx
    │   ├── GameCard.tsx
    │   ├── GameGrid.tsx
    │   ├── GamePage.tsx
    │   ├── ImageManagement.tsx
    │   ├── LoginForm.tsx
    │   ├── MainDashboard.tsx
    │   ├── MobileProfileCard.tsx
    │   ├── RegisterForm.tsx
    │   ├── UserAvatar.tsx
    │   ├── UserProfile.tsx
    │   ├── UserProfileSimple.tsx
    │   └── VoiceChatRoom.tsx
    ├── services/
    │   ├── api.ts
    │   └── websocket.ts
    └── types/
        └── index.ts
```

### 3. مجلد server (للتطوير فقط):
```
server/
├── index.ts
├── routes.ts
├── storage.ts
├── db.ts
└── vite.ts
```

### 4. مجلد shared:
```
shared/
└── schema.ts
```

### 5. ملفات قاعدة البيانات:
```
drizzle.config.ts
```

## خطوات النشر:

### الخطوة 1: تحضير الملفات
```bash
# تأكد من وجود جميع الملفات المذكورة أعلاه
# احذف الملفات غير المطلوبة:
rm -rf node_modules/
rm -rf dist/
rm -rf .git/
rm -f package-lock.json
```

### الخطوة 2: رفع على GitHub
```bash
git init
git add .
git commit -m "Complete INFINITY BOX gaming platform"
git remote add origin [YOUR_GITHUB_REPO_URL]
git push -u origin main
```

### الخطوة 3: إعداد Netlify
1. ربط repository من GitHub
2. إعداد متغيرات البيئة:
   - `VITE_API_URL = https://infinity-box-clean.onrender.com`
   - `VITE_WS_URL = wss://infinity-box-clean.onrender.com`
   - `NODE_VERSION = 20`

### الخطوة 4: إعدادات البناء في Netlify
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist/public`
- **Node Version**: 20

## محتوى package.json المحدث:
```json
{
  "name": "infinity-box",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "vite build",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "@replit/vite-plugin-cartographer": "^1.0.0",
    "@replit/vite-plugin-runtime-error-modal": "^1.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.0",
    "@types/pg": "^8.10.9",
    "@types/ws": "^8.5.10",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "drizzle-kit": "^0.20.6",
    "drizzle-orm": "^0.29.1",
    "drizzle-zod": "^0.5.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.447.0",
    "mongoose": "^7.6.3",
    "pg": "^8.11.3",
    "postcss": "^8.4.32",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.3.6",
    "tsx": "^4.6.2",
    "typescript": "^5.3.3",
    "vite": "^5.4.8",
    "wouter": "^3.0.0",
    "ws": "^8.16.0",
    "zod": "^3.22.4"
  }
}
```

## محتوى netlify.toml:
```toml
[build]
  publish = "dist/public"
  command = "npm ci && npm run build"

[build.environment]
  NODE_VERSION = "20"
  VITE_API_URL = "https://infinity-box-clean.onrender.com"
  VITE_WS_URL = "wss://infinity-box-clean.onrender.com"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## اختبار البناء محلياً:
```bash
npm ci
npm run build
```

إذا نجح البناء محلياً، سينجح على Netlify أيضاً.