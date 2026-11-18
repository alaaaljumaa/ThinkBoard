import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import notesRoutes from './routes/notesRoutes.js';
import { connectDB } from './config/db.js';
import ratelimiter from './middleware/rateLimiter.js';

const app = express();

// ===== CORS (تطوير فقط) =====
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));
}

// ===== Middlewares =====
app.use(express.json());
app.use(ratelimiter);

// ===== API Routes =====
app.use('/api/notes', notesRoutes);

// ===== Health check (اختياري لكن مفيد على Render) =====
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ===== Production: Static frontend + SPA fallback =====
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();

  // 1) خدمة ملفات dist
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // 2) SPA fallback — Express 5 compatible
  //    ❌ القديم: app.get('*', ...) → يرمي PathError
  //    ✅ الجديد: app.use() بدون مسار
  app.use((req, res, next) => {
    // طلبات API غير الموجودة ترجع 404 JSON بدل HTML
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// ===== تشغيل السيرفر =====
const PORT = process.env.PORT || 5001;

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}