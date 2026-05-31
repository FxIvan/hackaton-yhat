const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const TIMEZONE = 'America/Argentina/Buenos_Aires';

const WEEKDAY_MAP = {
  lunes: 1,
  martes: 2,
  miércoles: 3,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sábado: 6,
  sabado: 6,
  domingo: 0,
};

const MONTH_MAP = {
  enero: 1, febrero: 2, marzo: 3, abril: 4,
  mayo: 5, junio: 6, julio: 7, agosto: 8,
  septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

/**
 * Attempts to parse a natural language date/time string into ISO format.
 * Falls back to null if parsing fails.
 */
function parseNaturalDate(text) {
  if (!text) return null;

  const lower = text.toLowerCase().trim();
  const now = dayjs();

  // "mañana"
  if (lower === 'mañana' || lower === 'manana') {
    return now.add(1, 'day').startOf('day').toISOString();
  }

  // "hoy"
  if (lower === 'hoy') {
    return now.startOf('day').toISOString();
  }

  // "el {weekday}" or just "{weekday}"
  for (const [name, weekdayNum] of Object.entries(WEEKDAY_MAP)) {
    if (lower.includes(name)) {
      const current = now.day();
      let diff = weekdayNum - current;
      if (diff <= 0) diff += 7;
      return now.add(diff, 'day').startOf('day').toISOString();
    }
  }

  // "{day} de {month}" — e.g. "7 de julio"
  const dateMonthMatch = lower.match(/(\d{1,2})\s+de\s+(\w+)/);
  if (dateMonthMatch) {
    const day = parseInt(dateMonthMatch[1]);
    const monthName = dateMonthMatch[2];
    const month = MONTH_MAP[monthName];
    if (month) {
      const year = now.month() + 1 > month ? now.year() + 1 : now.year();
      return dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`).toISOString();
    }
  }

  // Try direct parse
  const direct = dayjs(text);
  if (direct.isValid()) return direct.toISOString();

  return null;
}

/**
 * Parses a time string like "18hs", "18:00", "6pm" into hours and minutes.
 * Returns { hour, minute } or null.
 */
function parseTime(text) {
  if (!text) return null;

  const lower = text.toLowerCase().trim();

  // "18hs" or "18h"
  const hsMatch = lower.match(/^(\d{1,2})h(?:s)?$/);
  if (hsMatch) return { hour: parseInt(hsMatch[1]), minute: 0 };

  // "18:30"
  const colonMatch = lower.match(/^(\d{1,2}):(\d{2})$/);
  if (colonMatch) return { hour: parseInt(colonMatch[1]), minute: parseInt(colonMatch[2]) };

  // "6pm" / "6am"
  const ampmMatch = lower.match(/^(\d{1,2})(am|pm)$/);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1]);
    if (ampmMatch[2] === 'pm' && hour < 12) hour += 12;
    if (ampmMatch[2] === 'am' && hour === 12) hour = 0;
    return { hour, minute: 0 };
  }

  return null;
}

/**
 * Combines a base date (ISO string) with time info to produce a full ISO datetime.
 */
function combineDateTime(baseDateISO, hour, minute) {
  return dayjs(baseDateISO).hour(hour).minute(minute).second(0).toISOString();
}

module.exports = { parseNaturalDate, parseTime, combineDateTime, TIMEZONE };
