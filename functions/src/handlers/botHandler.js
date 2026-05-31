const { getUser } = require('../services/firestoreService');
const { sendMessage, sendMessageWithButtons, answerCallbackQuery } = require('../services/telegramService');
const { handleEventRequest } = require('./eventHandler');

const MAIN_MENU_BUTTONS = [
  [{ text: '📅 Programar evento', callback_data: 'schedule' }],
  [{ text: '🗑️ Eliminar evento', callback_data: 'delete' }],
  [{ text: '🔄 Reprogramar evento', callback_data: 'reschedule' }],
  [{ text: '📚 Plan de estudio', callback_data: 'plan' }],
];

async function telegramWebhook(req, res) {
  // Acknowledge Telegram immediately to avoid retries
  res.sendStatus(200);

  try {
    const update = req.body;

    if (update.message) {
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }
  } catch (err) {
    console.error('Error in telegramWebhook:', err);
  }
}

async function handleMessage(message) {
  const telegramId = String(message.from.id);
  const text = message.text || '';
  const chatId = message.chat.id;

  if (text === '/start') {
    await handleStart(chatId, telegramId);
    return;
  }

  if (text === '/menu') {
    await sendMainMenu(chatId);
    return;
  }

  if (text === '/help') {
    await sendMessage(chatId, helpText());
    return;
  }

  const user = await getUser(telegramId);
  if (!user) {
    await sendMessage(
      chatId,
      '❌ Primero necesitás conectar tu Google Calendar.\nUsá /start para comenzar.'
    );
    return;
  }

  // Natural language request — pass to event handler
  await handleEventRequest(chatId, telegramId, text, null);
}

async function handleStart(chatId, telegramId) {
  const user = await getUser(telegramId);

  if (user) {
    await sendMessage(
      chatId,
      `👋 ¡Hola de nuevo, ${user.displayName}!\nTu Google Calendar ya está conectado.`
    );
    await sendMainMenu(chatId);
    return;
  }

  const authUrl = `${process.env.BASE_URL}/auth/start?telegramId=${telegramId}`;

  await sendMessageWithButtons(chatId, '👋 ¡Bienvenido a CalendarBot!\n\nPara comenzar, conectá tu Google Calendar:', [
    [{ text: '🔗 Conectar Google Calendar', url: authUrl }],
  ]);
}

async function handleCallbackQuery(callbackQuery) {
  // Dismiss the loading spinner on the button immediately
  await answerCallbackQuery(callbackQuery.id);

  const chatId = callbackQuery.message.chat.id;
  const telegramId = String(callbackQuery.from.id);
  const data = callbackQuery.data;

  const actionMap = {
    schedule: '📅 Decime qué evento querés programar. Podés escribirlo en lenguaje natural.\n\nEjemplo: *"El jueves tengo parcial a las 18hs"*',
    delete: '🗑️ Decime qué evento querés eliminar.\n\nEjemplo: *"Borrá el turno del odontólogo del martes"*',
    reschedule: '🔄 Decime qué evento querés reprogramar y cuándo.\n\nEjemplo: *"Pasá la reunión del lunes al miércoles a las 15hs"*',
    plan: '📚 Contame qué necesitás planificar.\n\nEjemplo: *"Armame 1 hora por día de estudio hasta el examen del viernes"*',
  };

  if (data === 'confirm_yes') {
    await handleEventRequest(chatId, telegramId, null, 'confirm');
    return;
  }

  if (data === 'confirm_no') {
    await handleEventRequest(chatId, telegramId, null, 'cancel');
    return;
  }

  if (actionMap[data]) {
    await sendMessage(chatId, actionMap[data], { parse_mode: 'Markdown' });
  }
}

async function sendMainMenu(chatId) {
  await sendMessageWithButtons(
    chatId,
    '¿Qué querés hacer hoy? 👇',
    MAIN_MENU_BUTTONS
  );
}

function helpText() {
  return `*CalendarBot — Ayuda*

Podés hablarme en lenguaje natural para gestionar tu Google Calendar.

*Ejemplos:*
• "El jueves tengo parcial de Análisis a las 18hs"
• "Borrá el turno del odontólogo del martes"
• "Pasá la reunión del lunes al miércoles"
• "Armame 1 hora por día de estudio hasta el viernes"

*Comandos:*
/start — Conectar Google Calendar
/menu — Menú principal
/help — Esta ayuda`;
}

module.exports = { telegramWebhook };
