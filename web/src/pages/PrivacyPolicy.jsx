import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Legal.module.css';

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link to="/" className={styles.back}>← Volver</Link>

        <h1 className={styles.title}>Política de Privacidad</h1>
        <p className={styles.updated}>Última actualización: 31 de mayo de 2025</p>

        <section className={styles.section}>
          <h2>¿Qué es CalendarBot?</h2>
          <p>
            CalendarBot es un asistente personal de calendario accesible desde Telegram. Utiliza
            inteligencia artificial (Google Gemini) para interpretar mensajes en lenguaje natural y
            gestionar eventos en tu Google Calendar: crear, modificar, eliminar y detectar conflictos
            de horario automáticamente.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Qué datos recopilamos</h2>
          <ul>
            <li>
              <strong>ID de usuario de Telegram:</strong> lo usamos para identificarte dentro del bot
              y vincularlo con tu cuenta de Google Calendar. No recopilamos tu nombre de usuario,
              teléfono ni ningún otro dato personal de Telegram.
            </li>
            <li>
              <strong>Tokens de acceso de Google:</strong> al autorizar la aplicación, Google nos
              entrega un token de acceso y un token de actualización (refresh token) que almacenamos
              de forma segura en Firestore (base de datos de Google Cloud). Estos tokens nos permiten
              interactuar con tu Google Calendar en tu nombre.
            </li>
            <li>
              <strong>Mensajes enviados al bot:</strong> los mensajes que enviás al bot de Telegram
              son procesados por Google Gemini para interpretar tu intención. No los almacenamos de
              forma permanente; solo se guardan temporalmente en memoria durante la sesión para
              mantener el contexto de la conversación.
            </li>
            <li>
              <strong>Eventos del calendario:</strong> leemos y escribimos eventos en tu Google
              Calendar únicamente cuando vos lo solicitás a través del bot. No almacenamos el
              contenido de tus eventos en nuestras bases de datos.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Cómo usamos tus datos</h2>
          <ul>
            <li>Para autenticarte y conectarte con tu Google Calendar.</li>
            <li>Para ejecutar las acciones que solicitás: crear, editar o eliminar eventos.</li>
            <li>Para detectar conflictos de horario y enviarte sugerencias.</li>
            <li>Para mantener el contexto de la conversación mientras usás el bot.</li>
          </ul>
          <p>
            No usamos tus datos para publicidad, análisis de comportamiento ni los compartimos
            con terceros fuera de los servicios de Google necesarios para el funcionamiento de
            la aplicación.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Terceros que intervienen</h2>
          <ul>
            <li>
              <strong>Google Calendar API:</strong> para leer y gestionar tus eventos. Sujeto a la{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Política de Privacidad de Google
              </a>.
            </li>
            <li>
              <strong>Google Gemini AI:</strong> para interpretar los mensajes en lenguaje natural.
              Los mensajes son procesados por la API de Gemini según los{' '}
              <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">
                Términos de uso de Gemini API
              </a>.
            </li>
            <li>
              <strong>Telegram:</strong> como canal de comunicación con el bot. Sujeto a la{' '}
              <a href="https://telegram.org/privacy" target="_blank" rel="noopener noreferrer">
                Política de Privacidad de Telegram
              </a>.
            </li>
            <li>
              <strong>Google Cloud / Firebase:</strong> para alojar la aplicación y almacenar los
              tokens de acceso de forma segura.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Alcance de los permisos de Google</h2>
          <p>
            La aplicación solicita acceso al scope{' '}
            <code>https://www.googleapis.com/auth/calendar</code>, que permite leer y modificar
            eventos en Google Calendar. Este permiso es necesario para cumplir la funcionalidad
            principal del bot. No solicitamos acceso a Gmail, Drive, Contacts ni ningún otro
            servicio de Google.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Almacenamiento y seguridad</h2>
          <p>
            Los tokens de acceso de Google se guardan en Firestore, una base de datos administrada
            por Google Cloud con cifrado en reposo y en tránsito. El acceso a la base de datos está
            restringido únicamente a la aplicación mediante reglas de seguridad de Firestore.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Retención de datos</h2>
          <p>
            Conservamos tus tokens de acceso mientras tu cuenta esté activa en el bot. Podés
            revocar el acceso en cualquier momento desde{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Permisos de tu cuenta de Google
            </a>
            . Al revocar el acceso, los tokens se vuelven inválidos automáticamente.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Tus derechos</h2>
          <ul>
            <li>Podés revocar el acceso a tu Google Calendar en cualquier momento.</li>
            <li>Podés solicitar la eliminación de tus datos contactándonos por correo.</li>
            <li>No vendemos ni alquilamos tus datos a terceros.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Contacto</h2>
          <p>
            Si tenés preguntas sobre esta política de privacidad, podés contactarnos en:{' '}
            <a href="mailto:almendraivan210814@gmail.com">almendraivan210814@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
