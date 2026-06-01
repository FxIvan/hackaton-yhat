const https = require('https');

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

function telegramRequest(method, body) {
  try {
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
            const parsed = JSON.parse(responseData);
            if (!parsed.ok) {
              console.error('telegramRequest ~ Telegram error:', JSON.stringify(parsed));
              reject(new Error(`Telegram API error: ${parsed.description} (code ${parsed.error_code})`));
            } else {
              resolve(parsed);
            }
          } catch (error){
            console.error('telegramRequest ~ parse error:', error, 'raw:', responseData)
            resolve(responseData);
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error('telegramRequest: ', error)
  }
}

async function sendMessage(chatId, text, options = {}) {
  return telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    ...options,
  });
}

async function sendMessageWithButtons(chatId, text, inlineKeyboard, options = {}) {
  try {
    return telegramRequest('sendMessage', {
      chat_id: chatId,
      text,
      reply_markup: { inline_keyboard: inlineKeyboard },
      ...options,
    });
  } catch (error) {
    console.error('sendMessageWithButtons: ', error)
  }
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
