# دليل النشر المحدث لـ INFINITY BOX

## المشكلة:
Netlify لا يستطيع العثور على `@vitejs/plugin-react` أثناء البناء

## الحل:

### 1. استبدال package.json للنشر:
```bash
# احذف package.json الحالي
rm package.json

# انسخ ملف package-deployment.json ليصبح package.json
cp package-deployment.json package.json
```

### 2. تحديث netlify.toml:
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

### 3. إنشاء ملف .nvmrc:
```
20
```

### 4. رفع الملفات لـ GitHub:
1. package.json (الجديد)
2. netlify.toml (المحدث)
3. .nvmrc
4. جميع ملفات المشروع

## متغيرات البيئة في Netlify:
- VITE_API_URL = https://infinity-box-clean.onrender.com
- VITE_WS_URL = wss://infinity-box-clean.onrender.com
- NODE_VERSION = 20