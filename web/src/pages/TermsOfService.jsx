import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Legal.module.css';

export default function TermsOfService() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link to="/" className={styles.back}>← Volver</Link>

        <h1 className={styles.title}>Condiciones del Servicio</h1>
        <p className={styles.updated}>Última actualización: 31 de mayo de 2025</p>

        <section className={styles.section}>
          <h2>1. Aceptación de las condiciones</h2>
          <p>
            Al usar CalendarBot, aceptás estas condiciones del servicio. Si no estás de acuerdo con
            alguna parte, no uses el servicio.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Descripción del servicio</h2>
          <p>
            CalendarBot es un bot de Telegram que usa inteligencia artificial para ayudarte a
            gestionar tu Google Calendar en lenguaje natural. El servicio incluye:
          </p>
          <ul>
            <li>Creación, modificación y eliminación de eventos en Google Calendar.</li>
            <li>Detección automática de conflictos de horario.</li>
            <li>Generación de planes de estudio y organización de tiempo.</li>
            <li>Interpretación de mensajes en lenguaje natural mediante Google Gemini AI.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Requisitos de uso</h2>
          <ul>
            <li>Necesitás tener una cuenta de Telegram activa.</li>
            <li>Necesitás tener una cuenta de Google con acceso a Google Calendar.</li>
            <li>Debés autorizar explícitamente el acceso de la aplicación a tu Google Calendar.</li>
            <li>El servicio es para uso personal, no comercial.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Uso aceptable</h2>
          <p>Acordás no usar CalendarBot para:</p>
          <ul>
            <li>Actividades ilegales o que violen los términos de Google o Telegram.</li>
            <li>Enviar spam o mensajes automatizados masivos al bot.</li>
            <li>Intentar acceder a calendarios de otras personas sin autorización.</li>
            <li>Realizar ingeniería inversa o explotar vulnerabilidades del servicio.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Acceso a Google Calendar</h2>
          <p>
            Al conectar tu cuenta de Google, otorgás a CalendarBot permiso para leer y modificar
            eventos en tu Google Calendar. Este acceso se usa únicamente para ejecutar las acciones
            que vos solicitás a través del bot. Podés revocar este acceso en cualquier momento
            desde{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Permisos de tu cuenta de Google
            </a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Limitación de responsabilidad</h2>
          <p>
            CalendarBot se provee "tal como está". No nos hacemos responsables por:
          </p>
          <ul>
            <li>
              Errores en la interpretación de mensajes que resulten en eventos incorrectos en tu
              calendario.
            </li>
            <li>Pérdida de datos en caso de fallos técnicos.</li>
            <li>
              Interrupciones del servicio por mantenimiento, actualizaciones o problemas en los
              servicios de terceros (Google, Telegram).
            </li>
            <li>Daños derivados del uso o la imposibilidad de usar el servicio.</li>
          </ul>
          <p>
            Recomendamos revisar los eventos creados por el bot antes de confiar en ellos para
            compromisos importantes.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Disponibilidad del servicio</h2>
          <p>
            No garantizamos disponibilidad continua del servicio. CalendarBot puede estar
            temporalmente fuera de servicio por mantenimiento o por dependencias externas como
            la API de Google o Telegram.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Modificaciones</h2>
          <p>
            Podemos modificar estas condiciones en cualquier momento. Los cambios se publicarán
            en esta página con la fecha de actualización. El uso continuado del servicio implica
            la aceptación de las nuevas condiciones.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Terminación</h2>
          <p>
            Podemos suspender o dar de baja el acceso al servicio si se detecta un uso que viole
            estas condiciones. Vos podés dejar de usar el servicio en cualquier momento revocando
            el acceso de la aplicación a tu cuenta de Google.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Contacto</h2>
          <p>
            Para consultas sobre estas condiciones, escribinos a:{' '}
            <a href="mailto:almendraivan210814@gmail.com">almendraivan210814@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
