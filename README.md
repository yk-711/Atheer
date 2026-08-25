# متجر سطول — النسخة المدمجة

- الواجهة: public/
- تسجيل الدخول: public/login.html
- Backend: backend/
- قاعدة البيانات: PostgreSQL

## التشغيل
1. ثبّت Node.js 20+.
2. ادخل backend ثم: npm install
3. انسخ .env.example إلى .env وضع بيانات PostgreSQL.
4. نفّذ schema.sql على قاعدة البيانات.
5. شغّل: npm start
6. افتح: http://localhost:3000

## ما يلزم للإطلاق الحقيقي
- استضافة تدعم Node.js.
- PostgreSQL مُتاح من الخادم.
- نطاق الموقع وربطه بالاستضافة.
- HTTPS/SSL.
- بريد SMTP حقيقي لاستعادة كلمة المرور والتحقق بالبريد.
- Google OAuth إذا أردت زر Google فعلياً.
- بوابة دفع مناسبة إذا أردت الدفع الإلكتروني.
- بيانات المنتجات/الطلبات الحقيقية وقواعد صلاحيات الإدارة.

## إعداد استعادة كلمة المرور عبر Supabase

أضف المتغيرات الموجودة في `backend/.env.example` إلى ملف `backend/.env`: `SUPABASE_URL` و`SUPABASE_ANON_KEY` و`SUPABASE_REDIRECT_URL`. في لوحة Supabase افتح Authentication ثم URL Configuration، وأضف عنوان `SUPABASE_REDIRECT_URL` ضمن Redirect URLs. بعد ذلك افتح `login.html` واضغط «نسيت كلمة المرور؟»؛ سيطلب الخادم من Supabase إرسال رابط حقيقي. الرابط يفتح `reset-password.html`، حيث تُحفظ كلمة المرور الجديدة عبر جلسة الاستعادة الموجودة في الرابط.

استخدم مفتاح `anon` العام فقط في هذا التدفق. لا تضع `service_role` في ملفات الواجهة أو في مستودع Git، ولا ترسله عبر المحادثة.
