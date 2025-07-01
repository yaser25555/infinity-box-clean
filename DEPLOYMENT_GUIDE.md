# دليل نشر INFINITY BOX

## نظرة عامة
هذا الدليل يشرح كيفية نشر تطبيق INFINITY BOX على منصات الاستضافة المختلفة.

## البناء للإنتاج

### الخطوة 1: بناء المشروع
```bash
node deployment-build.js
```

هذا الأمر سيقوم بـ:
- بناء الواجهة الأمامية باستخدام Vite
- نسخ كل ملفات الخادم المطلوبة
- إنشاء ملف package.json للإنتاج
- إنشاء نقطة بداية بسيطة

### الخطوة 2: التحقق من البناء
تأكد من وجود المجلد `dist/` بالهيكل التالي:
```
dist/
├── index.js          # نقطة البداية
├── package.json      # التبعيات للإنتاج
├── server/           # ملفات الخادم
├── shared/           # الملفات المشتركة  
├── public/           # الملفات الثابتة المبنية
├── tsconfig.json     # إعدادات TypeScript
└── drizzle.config.ts # إعدادات قاعدة البيانات
```

## النشر على Render

### 1. إعداد المشروع
1. ارفع المجلد `dist/` إلى مستودع GitHub جديد
2. أو استخدم المستودع الحالي مع تحديد مجلد `dist/` كمجلد الجذر

### 2. إنشاء خدمة جديدة على Render
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. انقر على "New +" واختر "Web Service"
3. اربط مستودع GitHub الخاص بك

### 3. إعدادات الخدمة
- **Name**: infinity-box
- **Region**: اختر الأقرب لمستخدميك
- **Branch**: main (أو الفرع الذي تستخدمه)
- **Root Directory**: `dist` (مهم!)
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. متغيرات البيئة
أضف المتغيرات التالية:
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=5000
```

### 5. النشر
انقر على "Create Web Service" وانتظر حتى يكتمل النشر.

## النشر على Railway

### 1. إعداد المشروع
```bash
# في المجلد الجذر
railway login
railway init
```

### 2. النشر
```bash
# انسخ ملفات dist إلى مجلد جديد
cp -r dist/* .
railway up
```

### 3. إضافة قاعدة البيانات
```bash
railway add
# اختر PostgreSQL
railway connect postgres
```

## النشر على Heroku

### 1. إنشاء Procfile في مجلد dist
```
web: npm start
```

### 2. النشر
```bash
cd dist
git init
git add .
git commit -m "Initial deployment"
heroku create infinity-box
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## النشر على Vercel (للواجهة الأمامية فقط)

إذا أردت نشر الواجهة الأمامية منفصلة:
```bash
cd dist/public
vercel
```

## نصائح مهمة

### 1. قاعدة البيانات
- تأكد من أن `DATABASE_URL` صحيح ويحتوي على SSL إذا لزم الأمر
- قد تحتاج لإضافة `?sslmode=require` في نهاية URL

### 2. الأمان
- لا تنس تغيير كلمات المرور الافتراضية
- استخدم HTTPS في الإنتاج
- قم بتعيين JWT_SECRET قوي

### 3. الأداء
- فعّل ضغط gzip
- استخدم CDN للملفات الثابتة
- فعّل التخزين المؤقت للملفات الثابتة

### 4. المراقبة
- استخدم خدمة مراقبة مثل UptimeRobot
- راقب استخدام الموارد
- قم بإعداد تنبيهات للأخطاء

## استكشاف الأخطاء

### خطأ: "Cannot find module"
تأكد من تشغيل `npm install` في مجلد dist

### خطأ: "Database connection failed"
- تحقق من DATABASE_URL
- تأكد من أن قاعدة البيانات تعمل
- تحقق من إعدادات الشبكة والجدار الناري

### خطأ: "Port already in use"
استخدم متغير البيئة PORT بدلاً من منفذ ثابت

## الدعم
للمساعدة، يرجى فتح issue على GitHub أو التواصل مع فريق الدعم.