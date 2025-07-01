# إصلاح مشكلة Dependencies في Render

## المشكلة:
```
Cannot find package 'mongoose' imported from server.js
```

## السبب:
package.json لا يحتوي على التبعيات المطلوبة لـ ES modules.

## الحل - تحديث package.json في GitHub:

```json
{
  "name": "infinity-box-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0", 
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## خطوات الإصلاح:

1. **في GitHub repository:**
   - افتح ملف `package.json`
   - اضغط رمز التحرير (القلم)
   - استبدل المحتوى بالكود أعلاه
   - اضغط "Commit changes"

2. **Render سيعيد النشر تلقائياً** مع جميع التبعيات.

3. **بعد 2-3 دقائق** سيعمل Backend على:
   ```
   https://mygame25bita-7eqw.onrender.com
   ```

## التحقق من النجاح:
- زيارة الرابط ستعرض: `{"message": "INFINITY BOX Backend يعمل! 🎮"}`
- API endpoints ستعمل للتسجيل وتسجيل الدخول
- لعبة الفاكهة ستتصل بقاعدة البيانات

بعد إصلاح Backend، سنرفع ملفات Frontend المحدثة لإكمال التكامل.