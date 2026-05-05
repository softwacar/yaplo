const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:5173', // Vite'nin default portu
  credentials: true,               // Cookie gönderimini aktif et
}));
app.use(express.json());
app.use(cookieParser());

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