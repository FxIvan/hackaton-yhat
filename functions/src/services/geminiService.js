const { GoogleGenerativeAI } = require('@google/generative-ai');
const dayjs = require('dayjs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Sos un asistente de agenda inteligente. El usuario habló con vos por Telegram.

Tu tarea:
1. Interpretar qué acción quiere realizar: create / delete / reschedule / plan.
2. Extraer fecha, hora, duración y descripción del evento.
3. Detectar si el nuevo evento choca con alguno existente, considerando tiempos de traslado razonables (mínimo 30 minutos entre eventos en distintas ubicaciones).
4. Si se pide un plan (ej: "estudiá 1 hora por día"), distribuir los eventos en los huecos libres disponibles en horarios razonables (8hs a 23hs).
5. Responder SOLO en JSON válido con esta estructura exacta, sin ningún texto adicional:
{
  "action": "create" | "delete" | "reschedule" | "plan",
  "events": [
    {
      "id": "eventId_si_es_delete_o_reschedule_o_null",
      "summary": "Título del evento",
      "description": "Descripción del evento",
      "start": "2025-07-07T18:00:00",
      "end": "2025-07-07T20:00:00"
    }
  ],
  "conflicts": ["Descripción de conflicto 1", "Descripción de conflicto 2"],
  "suggestion": "Mensaje amigable para el usuario explicando qué se va a hacer"
}

Reglas importantes:
- Nunca crear eventos antes de las 8:00 o después de las 23:00.
- Si hay conflicto, sugerí el horario alternativo más cercano disponible.
- Para planes de estudio, distribuí los bloques en días distintos evitando fines de semana si no hay eventos ese día.
- El campo "id" es obligatorio en delete y reschedule; usá el eventId del calendario existente.
- Responde SIEMPRE en español.`;

async function interpretMessage(userMessage, existingEvents) {
  const today = dayjs().format('YYYY-MM-DD');
  const timezone = 'America/Argentina/Buenos_Aires';

  const eventsContext = existingEvents.length
    ? existingEvents
        .map(
          (e) =>
            `- [${e.id}] ${e.summary}: ${dayjs(e.start.dateTime || e.start.date).format('ddd DD/MM HH:mm')} → ${dayjs(e.end.dateTime || e.end.date).format('HH:mm')}`
        )
        .join('\n')
    : 'No hay eventos próximos en el calendario.';

  const prompt = `${SYSTEM_PROMPT}

Hoy es ${today}. Timezone: ${timezone}.

Eventos actuales en el calendario para los próximos 14 días:
${eventsContext}

Mensaje del usuario: "${userMessage}"`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from response (handles markdown code blocks)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;

    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Error calling Gemini:', err);
    return null;
  }
}

module.exports = { interpretMessage };
