# 📅 CalendarBot — Asistente inteligente de calendario por Telegram

> Bot de Telegram potenciado con Gemini AI que permite al usuario gestionar su Google Calendar en lenguaje natural, detectando conflictos de horario y organizando eventos de forma inteligente.

---

## 🧠 ¿Qué es CalendarBot?

CalendarBot es un asistente conversacional que vive en Telegram y le permite al usuario gestionar su Google Calendar hablando en lenguaje natural. El usuario puede programar, eliminar y reprogramar eventos sin abrir ninguna app de calendario. La IA (Gemini) interpreta el mensaje, consulta el historial del calendario, detecta conflictos de tiempo y organiza los eventos de la manera más lógica posible.

**Ejemplo de uso real:**
> Usuario: *"El jueves 7 de julio tengo parcial de Análisis Matemático a las 18hs, armame un plan de estudio de 1 hora por día para llegar preparado"*

El bot detecta que a las 17:30 hay un turno con el odontólogo, identifica que llegar al examen a las 18:00 sería imposible, sugiere reprogramar el turno odontologico o ajusta la hora automáticamente. Además, crea eventos de estudio diarios en los espacios libres disponibles del calendario.

---

## ✨ Funcionalidades principales

### 1. Autenticación con Google (OAuth 2.0)
- El usuario recibe un link de login con Google desde el bot de Telegram.
- Completa el flujo OAuth una sola vez.
- El token se persiste en Firestore vinculado a su Telegram ID.
- A partir de ahí, el bot tiene acceso permanente a su Google Calendar (con refresh token).

### 2. Programar evento
- El usuario describe el evento en lenguaje natural.
- Gemini interpreta fecha, hora, título y contexto.
- El backend consulta el calendario del usuario en ese rango de tiempo.
- Gemini evalúa conflictos (superposición de eventos, tiempo de traslado, lógica de agenda) y propone el mejor slot.
- El evento se crea en Google Calendar con título y descripción generados por la IA.

### 3. Eliminar evento
- El usuario describe el evento a eliminar (ej: "borrá el turno del odontólogo del martes").
- Gemini identifica el evento en el historial del calendario.
- Se solicita confirmación al usuario antes de eliminar.
- Se elimina vía Google Calendar API.

### 4. Reprogramar evento
- El usuario indica qué evento quiere mover y cuándo.
- Gemini consulta el calendario, detecta conflictos en la nueva fecha/hora y propone alternativas si es necesario.
- Actualiza el evento en Google Calendar.

### 5. Plan de estudio / organización inteligente
- El usuario puede pedir que la IA le arme un plan: *"organizame 1 hora por día para estudiar hasta el examen"*.
- Gemini analiza el calendario, encuentra los huecos disponibles y crea múltiples eventos distribuidos inteligentemente.
- Evita solaparse con eventos existentes y respeta horarios razonables (no crea eventos a las 3am).

---

## 🏗️ Arquitectura del sistema

```
┌─────────────────┐         ┌──────────────────────┐
│  Usuario        │         │   Telegram Bot API   │
│  (Telegram)     │◄───────►│   (Webhook)          │
└─────────────────┘         └──────────┬───────────┘
                                        │ HTTP POST (update)
                                        ▼
                             ┌──────────────────────┐
                             │   Cloud Function     │
                             │   (Node.js)          │
                             │                      │
                             │  ┌────────────────┐  │
                             │  │  Bot Handler   │  │
                             │  │  Auth Handler  │  │
                             │  │  Event Handler │  │
                             │  └───────┬────────┘  │
                             └──────────┼───────────┘
                                        │
              ┌─────────────────────────┼──────────────────────┐
              │                         │                      │
              ▼                         ▼                      ▼
   ┌──────────────────┐    ┌────────────────────┐   ┌──────────────────┐
   │    Firestore     │    │   Gemini API       │   │ Google Calendar  │
   │                  │    │   (gemini-1.5-pro) │   │      API         │
   │  - users         │    │                   │   │                  │
   │  - sessions      │    │  - Interpretación │   │  - Events CRUD   │
   │  - conversations │    │  - Detección de   │   │  - FreeBusy      │
   └──────────────────┘    │    conflictos     │   │    Query         │
                           │  - Planificación  │   └──────────────────┘
                           └────────────────────┘
```

---

## 🛠️ Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Bot** | Telegram Bot API (webhooks) | Canal conversacional principal |
| **Backend** | Node.js + Cloud Functions (GCP) | Serverless, sin infraestructura que mantener, escala automáticamente |
| **IA** | Gemini 1.5 Pro (Google AI SDK) | Interpretación de lenguaje natural, detección de conflictos, generación de eventos |
| **Base de datos** | Firestore (GCP) | Persistencia de usuarios, tokens OAuth y contexto de conversación |
| **Calendario** | Google Calendar API | Lectura y escritura de eventos |
| **Autenticación** | OAuth 2.0 (Google Identity) | Login seguro con refresh token |
| **Frontend web** | React.js | Landing/página de inicio de sesión OAuth (opcional) |
| **Lenguaje** | JavaScript / Node.js | Stack unificado en todo el proyecto |
| **CI/CD** | Cloud Build + Firebase CLI | Deploy automatizado |

---

## 📁 Estructura del proyecto

```
calendarbot/
├── functions/                  # Cloud Functions (Node.js)
│   ├── src/
│   │   ├── handlers/
│   │   │   ├── botHandler.js       # Webhook principal de Telegram
│   │   │   ├── authHandler.js      # Flujo OAuth con Google
│   │   │   └── eventHandler.js     # Lógica de eventos (crear, eliminar, reprogramar)
│   │   ├── services/
│   │   │   ├── geminiService.js    # Integración con Gemini API
│   │   │   ├── calendarService.js  # Integración con Google Calendar API
│   │   │   ├── firestoreService.js # Operaciones con Firestore
│   │   │   └── telegramService.js  # Envío de mensajes a Telegram
│   │   ├── utils/
│   │   │   ├── conflictDetector.js # Lógica de detección de conflictos
│   │   │   └── dateParser.js       # Parseo y normalización de fechas
│   │   └── index.js               # Entry point de las Cloud Functions
│   ├── package.json
│   └── .env.example
│
├── web/                        # Frontend React (página de OAuth)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Página de inicio de sesión con Google
│   │   │   └── Success.jsx         # Confirmación post-login + redirect a Telegram
│   │   └── App.jsx
│   └── package.json
│
├── firestore.rules             # Reglas de seguridad de Firestore
├── firebase.json
└── README.md
```

---

## 🗄️ Modelo de datos (Firestore)

### Colección: `users`
```json
{
  "telegramId": "123456789",
  "googleId": "abc123",
  "email": "usuario@gmail.com",
  "displayName": "Juan Pérez",
  "accessToken": "ya29...",
  "refreshToken": "1//...",
  "tokenExpiry": "2025-07-07T12:00:00Z",
  "calendarId": "primary",
  "createdAt": "2025-06-01T10:00:00Z"
}
```

### Colección: `conversations`
```json
{
  "telegramId": "123456789",
  "lastAction": "schedule_event",
  "pendingConfirmation": true,
  "pendingEvent": {
    "summary": "Parcial Análisis Matemático",
    "start": "2025-07-07T18:00:00",
    "end": "2025-07-07T20:00:00",
    "description": "Examen parcial. Estudiar: álgebra lineal y series."
  },
  "updatedAt": "2025-07-01T15:30:00Z"
}
```

---

## 🔄 Flujo de usuario detallado

### Primera vez (autenticación)

```
Usuario escribe /start al bot
        │
        ▼
Bot responde con botón "Conectar Google Calendar"
        │
        ▼
Bot genera URL OAuth con state=telegramId
        │
        ▼
Usuario hace login en Google y autoriza permisos
        │
        ▼
Google redirige a Cloud Function /auth/callback
        │
        ▼
Backend guarda tokens en Firestore (vinculado al telegramId)
        │
        ▼
Bot envía mensaje en Telegram: "✅ ¡Listo! Ya podés usar CalendarBot"
        │
        ▼
Bot muestra menú principal con las 3 opciones
```

### Programar evento

```
Usuario elige "Programar evento" o escribe en lenguaje natural
        │
        ▼
Backend recibe mensaje → llama a Gemini para extraer:
  - Fecha y hora
  - Tipo de evento
  - Intención (¿también quiere plan de estudio?)
        │
        ▼
Backend consulta Google Calendar (FreeBusy API)
para el rango de días relevante
        │
        ▼
Gemini evalúa:
  - ¿Hay conflicto de horario?
  - ¿Hay tiempo de traslado suficiente?
  - ¿El horario es razonable?
  - ¿Se pidió plan de estudio?
        │
        ▼
Gemini devuelve evento(s) estructurado(s) con título y descripción
        │
        ▼
Bot muestra preview al usuario y pide confirmación
        │
        ▼
Usuario confirma → se crean los eventos en Google Calendar
```

---

## 🔐 Permisos requeridos (Google OAuth Scopes)

```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

---

## ⚙️ Variables de entorno

```env
# Telegram
TELEGRAM_BOT_TOKEN=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://<region>-<project>.cloudfunctions.net/authCallback

# Gemini
GEMINI_API_KEY=

# App
BASE_URL=https://<region>-<project>.cloudfunctions.net
FRONTEND_URL=https://<tu-dominio>.web.app
```

---

## 🚀 Setup inicial

### 1. Requisitos previos
- Cuenta de GCP con proyecto creado
- Firebase CLI instalado (`npm install -g firebase-tools`)
- Node.js 20+
- Bot de Telegram creado via [@BotFather](https://t.me/BotFather)

### 2. Configurar GCP
```bash
# Habilitar APIs necesarias
gcloud services enable \
  cloudfunctions.googleapis.com \
  calendar-json.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com
```

### 3. Instalar dependencias
```bash
cd functions && npm install
cd ../web && npm install
```

### 4. Configurar variables de entorno
```bash
cp functions/.env.example functions/.env
# Completar las variables en .env
```

### 5. Deploy
```bash
# Cloud Functions
firebase deploy --only functions

# Registrar webhook de Telegram
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<region>-<project>.cloudfunctions.net/telegramWebhook"

# Frontend (opcional)
firebase deploy --only hosting
```

---

## 📦 Dependencias principales (functions)

```json
{
  "dependencies": {
    "@google-cloud/firestore": "^7.0.0",
    "@google/generative-ai": "^0.15.0",
    "googleapis": "^140.0.0",
    "node-telegram-bot-api": "^0.66.0",
    "express": "^4.19.0",
    "dayjs": "^1.11.0",
    "dotenv": "^16.0.0"
  }
}
```

---

## 🧩 Prompt de Gemini (referencia)

El sistema le pasa a Gemini el contexto completo para que tome decisiones inteligentes:

```
Sos un asistente de agenda inteligente. El usuario habló con vos por Telegram.
Hoy es [fecha actual]. El timezone del usuario es [timezone].

Eventos actuales en el calendario del usuario para los próximos 14 días:
[lista de eventos con fecha, hora inicio, hora fin y título]

Mensaje del usuario: "[mensaje]"

Tu tarea:
1. Interpretar qué acción quiere realizar (crear / eliminar / reprogramar / planificar).
2. Extraer fecha, hora, duración y descripción del evento.
3. Detectar si el nuevo evento choca con algún existente, considerando también tiempos de traslado razonables (mínimo 30-60 minutos entre eventos en distintas ubicaciones).
4. Si se pide un plan (ej: "estudiá 1 hora por día"), distribuir los eventos en los huecos libres disponibles, en horarios razonables (8hs a 23hs).
5. Responder SOLO en JSON con la siguiente estructura:
{
  "action": "create" | "delete" | "reschedule" | "plan",
  "events": [...],
  "conflicts": [...],
  "suggestion": "Mensaje amigable para el usuario explicando qué se va a hacer"
}
```

---

## 🗺️ Roadmap

### MVP (v1.0)
- [x] Definición de arquitectura
- [ ] Autenticación OAuth con Google
- [ ] Webhook de Telegram + menú principal
- [ ] Crear evento en lenguaje natural (sin conflictos)
- [ ] Detección básica de conflictos de horario
- [ ] Eliminar evento
- [ ] Reprogramar evento
- [ ] Deploy en Cloud Functions

### v1.5
- [ ] Plan de estudio automático
- [ ] Detección de tiempo de traslado
- [ ] Confirmación interactiva con botones inline de Telegram
- [ ] Soporte multi-timezone

### v2.0
- [ ] Recordatorios y notificaciones proactivas
- [ ] Integración con Google Meet (crear videollamadas)
- [ ] Historial de conversación para contexto persistente
- [ ] Dashboard web (React) para ver el calendario

---

## 👥 Equipo

| Rol | Responsabilidad |
|---|---|
| **Full Stack / GCP** | Backend (Cloud Functions), integración APIs, infraestructura GCP, deploy |
| **Frontend** | React web (página OAuth + dashboard futuro) |

---

## 📄 Licencia

MIT — Proyecto interno de desarrollo.


---------------

https://calendarbot-51469636905.us-central1.run.app/auth/start?telegramId=1419249584


localhost:8080/auth/start?telegramId=1419249584





http://localhost:3000/?telegramId=1419249584



gcloud projects add-iam-policy-binding proyecto-laboratorio-467421 \
  --member="serviceAccount:51469636905-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"



curl "https://api.telegram.org/bot8731453894:AAG58Iq3ydISU-ZYeqAWmRrvofj723ovNJE/setWebhook?url=https://calendarbot-51469636905.us-central1.run.app/telegramWebhook"


Verificar:
curl "https://api.telegram.org/bot8731453894:AAG58Iq3ydISU-ZYeqAWmRrvofj723ovNJE/getWebhookInfo"


curl "https://api.telegram.org/bot8731453894:AAG58Iq3ydISU-ZYeqAWmRrvofj723ovNJE/setWebhook?url=https://api.argendabot.com/telegramWebhook"