# دليل النشر - نظام تتبع المفقودين أبشر

## خيارات النشر المتاحة

تم تجهيز المشروع للنشر على عدة منصات:

### 1. Railway (موصى به) 🚂

Railway منصة سهلة الاستخدام وتوفر خطة مجانية بقيمة $5 شهرياً.

#### خطوات النشر:

1. قم بإنشاء حساب على [Railway.app](https://railway.app)
2. قم بربط حساب GitHub الخاص بك
3. اضغط على "New Project" واختر "Deploy from GitHub repo"
4. اختر مستودع `promisexcod-cell/absher`
5. سيتم اكتشاف الإعدادات تلقائياً من ملف `railway.json`
6. أضف قاعدة بيانات MySQL من Railway:
   - اضغط على "+ New" في المشروع
   - اختر "Database" ثم "Add MySQL"
7. قم بإضافة المتغيرات البيئية التالية:
   ```
   DATABASE_URL=${{MySQL.DATABASE_URL}}
   PORT=3000
   NODE_ENV=production
   SESSION_SECRET=your-random-secret-key
   ```
8. اضغط على "Deploy" وانتظر اكتمال البناء

### 2. Render 🎨

Render منصة أخرى توفر خطة مجانية مع قيود بسيطة.

#### خطوات النشر:

1. قم بإنشاء حساب على [Render.com](https://render.com)
2. اضغط على "New +" واختر "Web Service"
3. اربط حساب GitHub واختر المستودع
4. املأ البيانات:
   - **Name**: absher-missing-persons
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
5. أضف قاعدة بيانات من TiDB Cloud (مجانية):
   - سجل في [TiDB Cloud](https://tidbcloud.com)
   - أنشئ Cluster مجاني
   - احصل على DATABASE_URL
6. أضف المتغيرات البيئية في Render
7. اضغط على "Create Web Service"

### 3. Fly.io ✈️

Fly.io منصة قوية مع خطة مجانية سخية.

#### خطوات النشر:

1. قم بتثبيت Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
2. سجل دخول:
   ```bash
   fly auth login
   ```
3. في مجلد المشروع:
   ```bash
   fly launch
   ```
4. اتبع التعليمات لإنشاء التطبيق
5. أضف قاعدة بيانات MySQL أو استخدم TiDB Cloud
6. قم بتعيين المتغيرات البيئية:
   ```bash
   fly secrets set DATABASE_URL="your-database-url"
   fly secrets set SESSION_SECRET="your-secret"
   ```
7. انشر التطبيق:
   ```bash
   fly deploy
   ```

### 4. Docker (للنشر على أي خادم) 🐳

إذا كان لديك خادم VPS خاص:

```bash
# بناء الصورة
docker build -t absher-app .

# تشغيل الحاوية
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e SESSION_SECRET="your-secret" \
  -e NODE_ENV=production \
  --name absher \
  absher-app
```

## المتغيرات البيئية المطلوبة

```env
DATABASE_URL=mysql://user:password@host:port/database
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-random-secret-key-here
```

## المتغيرات البيئية الاختيارية (للإنتاج)

```env
# AWS S3 لتخزين الصور
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# OAuth (إذا كنت تستخدم نظام المصادقة)
OAUTH_SERVER_URL=your-oauth-server-url
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret

# Analytics
VITE_ANALYTICS_ENDPOINT=your-analytics-endpoint
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

## قاعدة البيانات

المشروع يستخدم MySQL. يمكنك استخدام:

- **Railway MySQL**: مدمج مع Railway
- **TiDB Cloud**: مجاني تماماً مع Developer Tier
- **PlanetScale**: خطة مجانية سخية
- **AWS RDS**: للإنتاج الكبير

بعد إعداد قاعدة البيانات، قم بتشغيل:

```bash
pnpm db:push
```

## ملاحظات مهمة

1. تأكد من تعيين `SESSION_SECRET` إلى قيمة عشوائية قوية
2. قم بإعداد قاعدة البيانات قبل النشر
3. تأكد من تشغيل migrations قبل بدء التطبيق
4. للإنتاج، يُفضل استخدام AWS S3 لتخزين الصور بدلاً من التخزين المحلي

## الدعم

إذا واجهت أي مشاكل في النشر، يمكنك:
- فتح issue في GitHub
- مراجعة logs في منصة النشر
- التأكد من صحة المتغيرات البيئية
