const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore({ projectId: process.env.GCP_PROJECT_ID });

const USERS_KIND = 'users';
const CONVERSATIONS_KIND = 'conversations';

// Strip the internal Datastore KEY symbol so callers get a plain object
function toPlain(entity) {
  if (!entity) return null;
  const plain = { ...entity };
  delete plain[datastore.KEY];
  return plain;
}

// ── Users ──────────────────────────────────────────────────────────────────

async function getUser(telegramId) {
  const key = datastore.key([USERS_KIND, String(telegramId)]);
  const [entity] = await datastore.get(key);
  return toPlain(entity);
}

async function saveUser(telegramId, data) {
  const key = datastore.key([USERS_KIND, String(telegramId)]);
  const [existing] = await datastore.get(key);
  const merged = { ...toPlain(existing), ...data };
  await datastore.save({ key, data: merged });
}

// ── Conversations ──────────────────────────────────────────────────────────

async function getConversation(telegramId) {
  const key = datastore.key([CONVERSATIONS_KIND, String(telegramId)]);
  const [entity] = await datastore.get(key);
  return toPlain(entity);
}

async function saveConversation(telegramId, data) {
  const key = datastore.key([CONVERSATIONS_KIND, String(telegramId)]);
  const [existing] = await datastore.get(key);
  const merged = { ...toPlain(existing), ...data };
  await datastore.save({ key, data: merged });
}

async function clearConversation(telegramId) {
  const key = datastore.key([CONVERSATIONS_KIND, String(telegramId)]);
  await datastore.delete(key);
}

module.exports = {
  getUser,
  saveUser,
  getConversation,
  saveConversation,
  clearConversation,
};
