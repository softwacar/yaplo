const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const prisma = require('./utils/db');
const app = express();
const PORT = process.env.PORT || 5000;

// Test database connection
prisma.$connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection failed:', err));

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:5173', // Vite'nin default portu
  credentials: true,               // Cookie gönderimini aktif et
}));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const boardRoutes = require('./routes/board.routes');
app.use('/api/boards', boardRoutes);

const listRoutes = require('./routes/list.routes');
app.use('/api/boards/:boardId/lists', listRoutes);

const cardRoutes = require('./routes/card.routes');
app.use('/api/boards/:boardId/lists/:listId/cards', cardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Yaplo API is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Yaplo API running on http://localhost:${PORT}`);
});