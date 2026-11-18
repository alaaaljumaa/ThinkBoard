import express from 'express';
import cors from 'cors';                          
import notesRoutes from './routes/notesRoutes.js';
import { connectDB } from './config/db.js';
import ratelimiter from './middleware/rateLimiter.js';
import path from "path"

const app = express();

if(process.env.NODE_ENV !== 'production'){
  app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
}

app.use(express.json());
app.use(ratelimiter);
app.use('/api/notes', notesRoutes);

const PORT = process.env.PORT || 5001;

if(process.env.NODE_ENV === 'production'){
  const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend','dist', 'index.html'));
});
}

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}