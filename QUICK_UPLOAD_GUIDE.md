# دليل رفع ملفات Frontend السريع

## خطوات بسيطة:

### 1. انسخ الملفات يدوياً:

**الملفات المطلوبة من مجلد `netlify-deploy`:**

#### الملفات الأساسية:
```
index.html
fruit-catching.html
_redirects  
netlify.toml
```

#### مجلد assets:
```
assets/index-C3n4ielO.js
assets/index-xr0muCM1.css
```

#### مجلد images:
```
images/ (المجلد بالكامل مع جميع الصور)
```

#### مجلد sounds:
```
sounds/win.mp3
sounds/triple_shot.mp3
```

### 2. في GitHub repository للواجهة:

1. **احذف كل شيء** من repository
2. **ارفع الملفات** المذكورة أعلاه إلى الجذر الرئيسي
3. **تأكد من netlify.toml** في الجذر مع:
   ```toml
   [build]
     publish = "."
     command = "echo 'Using pre-built files'"
   ```

### 3. متغيرات البيئة في Netlify:
```
VITE_API_URL=https://mygame25bita-7eqw.onrender.com
VITE_WS_URL=wss://mygame25bita-7eqw.onrender.com
```

## النتيجة:
- لعبة الفاكهة 🍎 تظهر أولاً
- جميع الألعاب تعمل
- Backend متصل بالكامل

**الملفات جاهزة في مجلد `netlify-deploy` للنسخ المباشر!**