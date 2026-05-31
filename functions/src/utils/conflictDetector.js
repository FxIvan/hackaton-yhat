const dayjs = require('dayjs');

const MIN_TRAVEL_MINUTES = 30;

/**
 * Checks if a proposed event overlaps with existing calendar events.
 * Returns an array of conflict descriptions (empty = no conflicts).
 */
function detectConflicts(proposedEvents, existingEvents) {
  const conflicts = [];

  for (const proposed of proposedEvents) {
    const pStart = dayjs(proposed.start);
    const pEnd = dayjs(proposed.end);

    for (const existing of existingEvents) {
      const eStart = dayjs(existing.start.dateTime || existing.start.date);
      const eEnd = dayjs(existing.end.dateTime || existing.end.date);

      if (pStart.isBefore(eEnd) && pEnd.isAfter(eStart)) {
        conflicts.push(
          `"${proposed.summary}" (${pStart.format('HH:mm')}) se superpone con "${existing.summary}" (${eStart.format('HH:mm')} - ${eEnd.format('HH:mm')})`
        );
        continue;
      }

      // Check minimum travel gap
      const gapBefore = pStart.diff(eEnd, 'minute');
      const gapAfter = eStart.diff(pEnd, 'minute');

      if (gapBefore >= 0 && gapBefore < MIN_TRAVEL_MINUTES) {
        conflicts.push(
          `Solo hay ${gapBefore} min entre "${existing.summary}" y "${proposed.summary}". Se recomiendan al menos ${MIN_TRAVEL_MINUTES} min de traslado.`
        );
      }

      if (gapAfter >= 0 && gapAfter < MIN_TRAVEL_MINUTES) {
        conflicts.push(
          `Solo hay ${gapAfter} min entre "${proposed.summary}" y "${existing.summary}". Se recomiendan al menos ${MIN_TRAVEL_MINUTES} min de traslado.`
        );
      }
    }
  }

  return conflicts;
}

/**
 * Finds free time slots in a given day range.
 * Returns slots as { start, end } pairs in ISO format.
 */
function findFreeSlots(existingEvents, daysAhead = 14, durationMinutes = 60) {
  const slots = [];
  const now = dayjs();

  for (let d = 0; d < daysAhead; d++) {
    const date = now.add(d, 'day');
    const dayStart = date.hour(8).minute(0).second(0);
    const dayEnd = date.hour(23).minute(0).second(0);

    const dayEvents = existingEvents
      .filter((e) => {
        const eStart = dayjs(e.start.dateTime || e.start.date);
        return eStart.isSame(date, 'day');
      })
      .sort((a, b) =>
        dayjs(a.start.dateTime || a.start.date).diff(dayjs(b.start.dateTime || b.start.date))
      );

    let cursor = dayStart;

    for (const event of dayEvents) {
      const eStart = dayjs(event.start.dateTime || event.start.date);
      const eEnd = dayjs(event.end.dateTime || event.end.date);

      if (cursor.add(durationMinutes, 'minute').isBefore(eStart)) {
        slots.push({ start: cursor.toISOString(), end: cursor.add(durationMinutes, 'minute').toISOString() });
      }

      if (eEnd.isAfter(cursor)) cursor = eEnd;
    }

    // Last slot of the day
    if (cursor.add(durationMinutes, 'minute').isBefore(dayEnd)) {
      slots.push({ start: cursor.toISOString(), end: cursor.add(durationMinutes, 'minute').toISOString() });
    }
  }

  return slots;
}

module.exports = { detectConflicts, findFreeSlots };
