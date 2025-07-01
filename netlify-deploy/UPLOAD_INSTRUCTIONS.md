# تعليمات رفع Frontend على GitHub للنشر

## المشكلة الحالية:
الموقع على infinity-box25.netlify.app يعرض النسخة القديمة بدون التعديلات الجديدة

## الحل:
جميع الملفات المُحدثة موجودة في هذا المجلد وجاهزة للرفع

## ملفات مُحدثة للرفع:

### الملفات الأساسية:
- `index.html` - الصفحة الرئيسية المُحدثة
- `assets/index-C3n4ielO.js` - JavaScript المُحدث مع Render backend
- `assets/index-xr0muCM1.css` - التصميم المُحدث
- `fruit-catching.html` - لعبة الفاكهة المُحدثة
- `_redirects` - إعدادات Netlify
- `netlify.toml` - إعدادات النشر

### خطوات الرفع:

**مهم جداً:**
1. **احذف جميع الملفات القديمة** من GitHub repository للواجهة الأمامية
2. **ارفع جميع ملفات هذا المجلد** إلى **الجذر الرئيسي** للـ repository (وليس في مجلد dist)
3. **تأكد من رفع netlify.toml المُحدث** (publish = "." وليس "dist")
4. **انتظر إعادة نشر Netlify** (1-2 دقائق)

**ملاحظة:** الملفات يجب أن تكون في الجذر الرئيسي للـ repository:
```
repository/
├── index.html
├── assets/
├── fruit-catching.html
├── _redirects
├── netlify.toml
└── ...
```

## النتيجة المتوقعة:
- ✅ لعبة الفاكهة تظهر أولاً مع إيقونة 🍎
- ✅ الاتصال مع Render backend يعمل
- ✅ تسجيل الدخول والألعاب تعمل
- ✅ جميع التعديلات الجديدة تظهر

## متغيرات البيئة في Netlify:
تأكد من إضافة:
```
VITE_API_URL=https://mygame25bita-7eqw.onrender.com
VITE_WS_URL=wss://mygame25bita-7eqw.onrender.com
```

## تأكيد العمل:
بعد الرفع، اختبر:
1. زيارة infinity-box25.netlify.app
2. تسجيل دخول جديد
3. لعبة الفاكهة تعمل وتحفظ النقاط
4. جميع المزايا الجديدة متاحة