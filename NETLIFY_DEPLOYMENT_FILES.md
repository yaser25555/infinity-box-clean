# ملفات النشر الجاهزة - نسخ ولصق فقط

## الملفات الأساسية فقط (4 ملفات):

### 1. index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <script type="module" crossorigin src="/assets/index-C3n4ielO.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-xr0muCM1.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 2. netlify.toml
```toml
[build]
  publish = "."
  command = "echo 'Using pre-built files'"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. _redirects
```
/*    /index.html   200
```

### 4. package.json (اختياري)
```json
{
  "name": "infinity-box-frontend",
  "version": "1.0.0",
  "type": "module"
}
```

## خطوات بسيطة:

1. **احذف كل شيء** من GitHub repository
2. **أنشئ الملفات الـ 4** أعلاه (نسخ ولصق)
3. **ارفع مجلد assets** من netlify-deploy (ملفين فقط)
4. **ارفع fruit-catching.html** من netlify-deploy

## هذا كل شيء!

الملفات الأساسية فقط - لا حاجة لتحميل آلاف الصور.

سيعمل الموقع بدون المجلد images لأن معظمها غير مستخدم.