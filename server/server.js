require('dotenv').config();
console.log('--- Environment Check ---');
console.log('BREVO SERVICE Loaded:', process.env.SMTP_USER ? `Yes (${process.env.SMTP_USER})` : 'No');
console.log('------------------------');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { startScheduler } = require('./utils/scheduler');

// Route files
const authRoutes = require('./routes/authRoutes');
const psReminderRoutes = require('./routes/psReminderRoutes');
const csReminderRoutes = require('./routes/csReminderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : [
      'http://localhost:5173',
      'https://capsuley.netlify.app',
      'https://unsent.sarvan.me'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    } else {
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PS Reminder Management System API' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/capsules', psReminderRoutes);
app.use('/api/cs-reminders', csReminderRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler Middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Start capsule delivery scheduler
startScheduler();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
