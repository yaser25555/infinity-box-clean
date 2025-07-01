# إصلاح مشكلة نشر Render Backend

## المشكلة:
```
cd: api: No such file or directory
==> Build failed 😞
```

## السبب:
Render يحاول الوصول لمجلد `api` لكن الملفات في المجلد الرئيسي.

## الحل - تحديث إعدادات Render:

### 1. في Render Dashboard:
- انتقل لـ Service Settings
- غير Build Command من:
  ```
  cd api && npm install
  ```
  إلى:
  ```
  npm install
  ```

### 2. تحديث Start Command:
- غير من: `cd api && node server.js`
- إلى: `node server.js`

### 3. Root Directory:
- اتركه فارغ أو ضع `.` (النقطة)

## البديل - رفع ملفات Backend جديدة:

إذا لم تنجح الطريقة الأولى، ارفع هذه الملفات لـ GitHub:

### الملفات المطلوبة:
1. `server.js` - الخادم المحدث
2. `package.json` - التبعيات
3. `User.js` - نموذج المستخدم
4. `.env` - متغيرات البيئة

### محتوى server.js المحدث:
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS للسماح بالوصول من Netlify
app.use(cors({
  origin: ['https://infinity-box25.netlify.app', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// اتصال MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ متصل بـ MongoDB'))
  .catch(err => console.error('❌ خطأ MongoDB:', err));

// باقي الـ API routes...

app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
});
```

بعد التحديث، Render سيعيد النشر تلقائياً وسيعمل Backend بشكل صحيح.