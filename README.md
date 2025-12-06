# نظام تتبع المفقودين - أبشر

نظام متكامل للإبلاغ عن الأشخاص المفقودين والبحث عنهم باستخدام تقنيات التعرف على الوجوه.

## 🎯 المميزات

- **الإبلاغ عن المفقودين**: تسجيل بلاغات الأشخاص المفقودين مع الصور والمعلومات الشخصية
- **البحث بالكاميرا**: استخدام الكاميرا المباشرة للبحث عن المفقودين
- **تحليل الفيديو**: رفع فيديو وتحليله للبحث عن الأشخاص المفقودين باستخدام AWS Rekognition
- **نظام المصادقة**: تسجيل دخول آمن للمستخدمين
- **واجهة عربية**: دعم كامل للغة العربية مع تصميم RTL

## 🚀 التقنيات المستخدمة

### Frontend
- **React 19** - مكتبة بناء واجهات المستخدم
- **TypeScript** - لغة البرمجة
- **Vite** - أداة البناء
- **TailwindCSS** - إطار عمل CSS
- **Wouter** - للتوجيه (Routing)
- **tRPC** - للاتصال بين Frontend و Backend
- **React Query** - لإدارة حالة البيانات

### Backend
- **Node.js** - بيئة التشغيل
- **Express** - إطار عمل الخادم
- **tRPC** - للـ API Type-Safe
- **Drizzle ORM** - للتعامل مع قاعدة البيانات
- **MySQL** - قاعدة البيانات

### UI Components
- **Radix UI** - مكونات واجهة المستخدم
- **Lucide React** - الأيقونات
- **Sonner** - الإشعارات

## 📦 التثبيت والتشغيل

### المتطلبات
- Node.js 22+
- pnpm 10+
- MySQL 8+

### خطوات التثبيت

1. **استنساخ المستودع**
```bash
git clone https://github.com/promisexcod-cell/absher.git
cd absher
```

2. **تثبيت التبعيات**
```bash
pnpm install
```

3. **إعداد المتغيرات البيئية**
```bash
cp .env.example .env
```

قم بتعديل ملف `.env` وأضف المعلومات التالية:
```env
DATABASE_URL=mysql://user:password@localhost:3306/absher
PORT=3000
SESSION_SECRET=your-random-secret-key
OAUTH_SERVER_URL=http://localhost:3000
VITE_OAUTH_PORTAL_URL=http://localhost:3000
VITE_APP_ID=absher
```

4. **إعداد قاعدة البيانات**
```bash
pnpm db:push
```

5. **تشغيل التطبيق في وضع التطوير**
```bash
pnpm dev
```

6. **بناء التطبيق للإنتاج**
```bash
pnpm build
pnpm start
```

## 🎨 التحديثات الأخيرة

### صفحة تحليل الفيديو
تم تحديث صفحة تحليل الفيديو لتشمل:

- ✅ قسم تحذير عندما لا يوجد أشخاص مفقودين مسجلين
- ✅ تحديث النص الفرعي ليذكر AWS Rekognition
- ✅ إضافة زر برتقالي "إضافة بلاغ جديد" مع سهم
- ✅ تحسين التصميم والألوان

## 📱 الصفحات الرئيسية

- `/` - الصفحة الرئيسية
- `/report` - إبلاغ عن مفقود
- `/detection` - البحث بالكاميرا
- `/video-analysis` - تحليل الفيديو

## 🔧 البنية

```
absher/
├── client/              # Frontend (React)
│   ├── src/
│   │   ├── pages/      # صفحات التطبيق
│   │   ├── components/ # المكونات
│   │   ├── lib/        # المكتبات المساعدة
│   │   └── hooks/      # React Hooks
│   └── public/         # الملفات الثابتة
├── server/             # Backend (Express + tRPC)
│   ├── routers/        # API Routes
│   └── _core/          # الملفات الأساسية
├── shared/             # الملفات المشتركة
└── drizzle/            # Database Migrations
```

## 🚀 النشر

راجع ملف [DEPLOYMENT.md](./DEPLOYMENT.md) للحصول على تعليمات مفصلة للنشر على:
- Railway
- Render
- Fly.io
- Docker

## 📝 الترخيص

MIT License

## 🤝 المساهمة

المساهمات مرحب بها! يرجى فتح Issue أو Pull Request.

## 📧 التواصل

للاستفسارات والدعم، يرجى فتح Issue في GitHub.

---

تم التطوير بواسطة فريق أبشر 🇸🇦
