const { google } = require('googleapis');
const { saveUser, getUser } = require('../services/firestoreService');
const { sendMessage, sendMessageWithButtons } = require('../services/telegramService');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

function createOAuthClient() {
    console.log("🚀 ~ createOAuthClient ~ process.env.GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID)
    console.log("🚀 ~ createOAuthClient ~ process.env.GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET)
    console.log("🚀 ~ createOAuthClient ~ process.env.GOOGLE_REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI)
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// GET /auth/start?telegramId=xxx
// Generates the Google OAuth URL and redirects
async function authStart(req, res) {
  const { telegramId } = req.query;
  if (!telegramId) {
    return res.status(400).send('Missing telegramId parameter');
  }

  const oauth2Client = createOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: telegramId,
  });
  console.log("🚀 ~ authStart ~ url:", url)

  res.redirect(url);
}

// GET /auth/callback?code=xxx&state=telegramId
// Exchanges the authorization code for tokens and saves user in Firestore
async function authCallback(req, res) {
  const { code, state: telegramId, error } = req.query;

  if (error) {
    console.error('OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/error?reason=${error}`);
  }

  if (!code || !telegramId) {
    return res.status(400).send('Missing code or telegramId');
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get Google user profile
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    const userData = {
      telegramId,
      googleId: profile.id,
      email: profile.email,
      displayName: profile.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
      calendarId: 'primary',
      createdAt: new Date().toISOString(),
    };

    await saveUser(telegramId, userData);

    // Notify user via Telegram
    await sendMessage(
      telegramId,
      `✅ ¡Listo! Conectaste tu Google Calendar correctamente.\n\nBienvenido, *${profile.name}*! Ya podés usar CalendarBot.`,
      { parse_mode: 'Markdown' }
    );

    // Show main menu buttons
    await sendMessageWithButtons(
      telegramId,
      '¿Qué querés hacer?',
      [
        [{ text: '📅 Programar evento', callback_data: 'schedule' }],
        [{ text: '🗑️ Eliminar evento', callback_data: 'delete' }],
        [{ text: '🔄 Reprogramar evento', callback_data: 'reschedule' }],
        [{ text: '📚 Plan de estudio', callback_data: 'plan' }],
      ]
    );

    res.redirect(`${process.env.FRONTEND_URL}/success?name=${encodeURIComponent(profile.name)}`);
  } catch (err) {
    console.error('Error in authCallback:', err);
    res.redirect(`${process.env.FRONTEND_URL}/error?reason=server_error`);
  }
}

// Returns a refreshed OAuth client for a given user
async function getAuthClientForUser(user) {
  const oauth2Client = createOAuthClient();

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
    expiry_date: user.tokenExpiry ? new Date(user.tokenExpiry).getTime() : null,
  });

  // Auto-refresh listener: persist new tokens when refreshed
  oauth2Client.on('tokens', async (tokens) => {
    const updates = { accessToken: tokens.access_token };
    if (tokens.refresh_token) updates.refreshToken = tokens.refresh_token;
    if (tokens.expiry_date) updates.tokenExpiry = new Date(tokens.expiry_date).toISOString();
    await saveUser(user.telegramId, updates);
  });

  return oauth2Client;
}

module.exports = { authStart, authCallback, getAuthClientForUser };
