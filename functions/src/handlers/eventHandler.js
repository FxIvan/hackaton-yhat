const dayjs = require('dayjs');
const { getUser, getConversation, saveConversation, clearConversation } = require('../services/firestoreService');
const { sendMessage, sendMessageWithButtons } = require('../services/telegramService');
const { interpretMessage } = require('../services/geminiService');
const { getUpcomingEvents, createEvent, deleteEvent, updateEvent } = require('../services/calendarService');
const { getAuthClientForUser } = require('./authHandler');

const CONFIRM_BUTTONS = [
  [
    { text: '✅ Confirmar', callback_data: 'confirm_yes' },
    { text: '❌ Cancelar', callback_data: 'confirm_no' },
  ],
];

async function handleEventRequest(chatId, telegramId, text, action) {
  const user = await getUser(telegramId);
  if (!user) {
    await sendMessage(chatId, '❌ Primero conectá tu Google Calendar con /start');
    return;
  }

  // Handle pending confirmation
  if (action === 'confirm' || action === 'cancel') {
    await handleConfirmation(chatId, telegramId, user, action);
    return;
  }

  if (!text) return;

  try {
    await sendMessage(chatId, '⏳ Procesando tu solicitud...');

    const authClient = await getAuthClientForUser(user);
    const events = await getUpcomingEvents(authClient, user.calendarId, 14);

    const geminiResponse = await interpretMessage(text, events);

    if (!geminiResponse) {
      await sendMessage(chatId, '⚠️ No pude entender tu solicitud. Intentá de nuevo con más detalle.');
      return;
    }

    const { action: geminiAction, events: targetEvents, conflicts, suggestion } = geminiResponse;

    // Show conflicts if any
    if (conflicts && conflicts.length > 0) {
      const conflictText = conflicts.map(c => `• ${c}`).join('\n');
      await sendMessage(chatId, `⚠️ *Conflictos detectados:*\n${conflictText}`, { parse_mode: 'Markdown' });
    }

    // Build preview and ask for confirmation
    const preview = buildPreview(geminiAction, targetEvents, suggestion);

    await saveConversation(telegramId, {
      lastAction: geminiAction,
      pendingConfirmation: true,
      pendingEvents: targetEvents,
      updatedAt: new Date().toISOString(),
    });

    await sendMessageWithButtons(chatId, preview, CONFIRM_BUTTONS, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Error in handleEventRequest:', err);
    await sendMessage(chatId, '❌ Ocurrió un error. Por favor intentá de nuevo.');
  }
}

async function handleConfirmation(chatId, telegramId, user, action) {
  const conversation = await getConversation(telegramId);

  if (!conversation || !conversation.pendingConfirmation) {
    await sendMessage(chatId, '⚠️ No hay ninguna acción pendiente de confirmación.');
    return;
  }

  if (action === 'cancel') {
    await clearConversation(telegramId);
    await sendMessage(chatId, '❌ Acción cancelada. ¿En qué más te puedo ayudar?');
    return;
  }

  // action === 'confirm'
  try {
    const authClient = await getAuthClientForUser(user);
    const { lastAction, pendingEvents } = conversation;

    let resultMessage = '';

    if (lastAction === 'create' || lastAction === 'plan') {
      const created = [];
      for (const event of pendingEvents) {
        const result = await createEvent(authClient, user.calendarId, event);
        created.push(result.summary);
      }
      resultMessage = `✅ ¡Listo! Se crearon ${created.length} evento(s):\n${created.map(s => `• ${s}`).join('\n')}`;
    } else if (lastAction === 'delete') {
      for (const event of pendingEvents) {
        await deleteEvent(authClient, user.calendarId, event.id);
      }
      resultMessage = `✅ Evento(s) eliminado(s) correctamente.`;
    } else if (lastAction === 'reschedule') {
      for (const event of pendingEvents) {
        await updateEvent(authClient, user.calendarId, event.id, event);
      }
      resultMessage = `✅ Evento(s) reprogramado(s) correctamente.`;
    }

    await clearConversation(telegramId);
    await sendMessage(chatId, resultMessage);
  } catch (err) {
    console.error('Error executing confirmed action:', err);
    await sendMessage(chatId, '❌ Hubo un error al ejecutar la acción. Intentá de nuevo.');
  }
}

function buildPreview(action, events, suggestion) {
  const actionLabels = {
    create: '📅 Crear evento(s)',
    delete: '🗑️ Eliminar evento(s)',
    reschedule: '🔄 Reprogramar evento(s)',
    plan: '📚 Plan de estudio',
  };

  const label = actionLabels[action] || 'Acción';

  const eventsText = events
    .map((e) => {
      const start = e.start ? dayjs(e.start).format('ddd DD/MM HH:mm') : '';
      const end = e.end ? dayjs(e.end).format('HH:mm') : '';
      return `• *${e.summary}* — ${start}${end ? ` → ${end}` : ''}`;
    })
    .join('\n');

  return `*${label}*\n\n${eventsText}\n\n💬 ${suggestion}\n\n¿Confirmar?`;
}

module.exports = { handleEventRequest };
