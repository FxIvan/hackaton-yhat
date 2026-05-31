require('dotenv').config();
const express = require('express');
const { telegramWebhook } = require('./handlers/botHandler');
const { authStart, authCallback } = require('./handlers/authHandler');

const app = express();
app.use(express.json());

// Telegram webhook — receives updates from Telegram
app.post('/telegramWebhook', telegramWebhook);

// OAuth routes
app.get('/auth/start', authStart);
app.get('/auth/callback', authCallback);

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', service: 'CalendarBot' }));

// K_SERVICE is set automatically by Cloud Functions/Cloud Run — skip listen there
if (!process.env.K_SERVICE) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`CalendarBot running on port ${PORT}`));
}

// Cloud Functions entry point (--entry-point=calendarbot)
exports.calendarbot = app;
