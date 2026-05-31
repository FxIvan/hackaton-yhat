const { google } = require('googleapis');
const dayjs = require('dayjs');

function getCalendar(authClient) {
  return google.calendar({ version: 'v3', auth: authClient });
}

async function getUpcomingEvents(authClient, calendarId = 'primary', daysAhead = 14) {
  const calendar = getCalendar(authClient);

  const timeMin = dayjs().toISOString();
  const timeMax = dayjs().add(daysAhead, 'day').toISOString();

  const response = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 100,
  });

  return response.data.items || [];
}

async function getFreeBusy(authClient, calendarId = 'primary', daysAhead = 14) {
  const calendar = getCalendar(authClient);

  const timeMin = dayjs().toISOString();
  const timeMax = dayjs().add(daysAhead, 'day').toISOString();

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    },
  });

  return response.data.calendars[calendarId]?.busy || [];
}

async function createEvent(authClient, calendarId = 'primary', eventData) {
  const calendar = getCalendar(authClient);

  const event = {
    summary: eventData.summary,
    description: eventData.description || '',
    start: {
      dateTime: eventData.start,
      timeZone: 'America/Argentina/Buenos_Aires',
    },
    end: {
      dateTime: eventData.end,
      timeZone: 'America/Argentina/Buenos_Aires',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({ calendarId, requestBody: event });
  return response.data;
}

async function deleteEvent(authClient, calendarId = 'primary', eventId) {
  const calendar = getCalendar(authClient);
  await calendar.events.delete({ calendarId, eventId });
}

async function updateEvent(authClient, calendarId = 'primary', eventId, eventData) {
  const calendar = getCalendar(authClient);

  const patch = {};
  if (eventData.summary) patch.summary = eventData.summary;
  if (eventData.description) patch.description = eventData.description;
  if (eventData.start) {
    patch.start = { dateTime: eventData.start, timeZone: 'America/Argentina/Buenos_Aires' };
  }
  if (eventData.end) {
    patch.end = { dateTime: eventData.end, timeZone: 'America/Argentina/Buenos_Aires' };
  }

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: patch,
  });

  return response.data;
}

module.exports = { getUpcomingEvents, getFreeBusy, createEvent, deleteEvent, updateEvent };
