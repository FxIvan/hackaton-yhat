import React, { useEffect, useState } from 'react';
import styles from './Success.module.css';

const TELEGRAM_BOT_USERNAME = process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'CalendarBot';

export default function Success() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name') || 'Usuario';

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const telegramUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.checkmark}>✅</div>

        <h1 className={styles.title}>¡Todo listo!</h1>
        <p className={styles.greeting}>
          Hola, <strong>{name}</strong>!
        </p>
        <p className={styles.subtitle}>
          Tu Google Calendar fue conectado correctamente. Ya podés usar CalendarBot en Telegram.
        </p>

        <div className={styles.features}>
          <p className={styles.featureTitle}>Ahora podés:</p>
          <ul className={styles.featureList}>
            <li>📅 Programar eventos en lenguaje natural</li>
            <li>🔄 Reprogramar y eliminar eventos</li>
            <li>📚 Crear planes de estudio automáticos</li>
            <li>⚡ Detectar conflictos de horario</li>
          </ul>
        </div>

        <a href={telegramUrl} className={styles.button}>
          Ir a Telegram
        </a>

        <p className={styles.redirect}>
          Redirigiendo automáticamente en <strong>{countdown}</strong> segundo{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  );
}
