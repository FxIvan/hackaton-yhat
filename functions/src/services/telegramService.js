const https = require('https');

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

function telegramRequest(method, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(`${BASE_URL}/${method}`);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => (responseData += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendMessage(chatId, text, options = {}) {
  return telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    ...options,
  });
}

async function sendMessageWithButtons(chatId, text, inlineKeyboard, options = {}) {
  return telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: { inline_keyboard: inlineKeyboard },
    ...options,
  });
}

async function answerCallbackQuery(callbackQueryId, text = '') {
  return telegramRequest('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  });
}

async function setWebhook(webhookUrl) {
  return telegramRequest('setWebhook', { url: webhookUrl });
}

module.exports = { sendMessage, sendMessageWithButtons, answerCallbackQuery, setWebhook };
