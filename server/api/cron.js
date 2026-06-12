// This file is the Vercel Cron Job handler
// It is called by Vercel on a schedule defined in vercel.json
// It replaces the local node-cron scheduler that runs in development

require('dotenv').config();
const connectDB = require('../config/db');
const { scanAndSendReminders, scanAndSendCSReminders } = require('../utils/scheduler');

let isConnected = false;

module.exports = async (req, res) => {
  // Security: Only allow Vercel Cron or internal calls
  const authHeader = req.headers['authorization'];
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Reuse existing DB connection if available (serverless connection pooling)
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  try {
    console.log('⏰ Vercel Cron: Running PS & CS reminder scan...');
    await scanAndSendReminders();
    await scanAndSendCSReminders();
    console.log('✅ Vercel Cron: Reminder scan complete.');
    res.status(200).json({ success: true, message: 'Reminders processed' });
  } catch (err) {
    console.error('❌ Vercel Cron error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
