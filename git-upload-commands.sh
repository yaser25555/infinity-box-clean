#!/bin/bash

# أوامر Git لرفع ملفات النشر المحدثة إلى GitHub

echo "نسخ الملفات المحدثة..."

# نسخ الملف الرئيسي
cp netlify-deploy/index.html ./

# نسخ ملفات الأصول
mkdir -p assets
cp netlify-deploy/assets/index-C3n4ielO.js ./assets/
cp netlify-deploy/assets/index-xr0muCM1.css ./assets/

# نسخ لعبة الفاكهة
cp netlify-deploy/fruit-catching.html ./

echo "إضافة الملفات إلى Git..."

# إضافة جميع الملفات المحدثة
git add index.html
git add assets/index-C3n4ielO.js
git add assets/index-xr0muCM1.css
git add fruit-catching.html

# تسجيل التغييرات
git commit -m "تحديث الموقع: إصلاح اتصال Backend وإضافة لعبة الفاكهة في المقدمة"

# رفع التحديثات
git push origin main

echo "تم رفع التحديثات إلى GitHub بنجاح!"
echo "Netlify سينشر التحديثات تلقائياً في دقائق..."