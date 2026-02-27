const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const { notFoundHandler, errorHandler } = require('./middleware/error');

const app = express();

app.disable('x-powered-by');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('combined'));

// In production, frontend + API are same-origin via Nginx.
// Keeping CORS enabled (restricted) helps local dev without breaking prod.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : process.env.NODE_ENV === 'production'
        ? false
        : true,
    credentials: false,
  })
);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
