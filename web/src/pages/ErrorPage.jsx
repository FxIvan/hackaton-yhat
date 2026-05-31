import React from 'react';
import styles from './ErrorPage.module.css';

const ERROR_MESSAGES = {
  access_denied: 'Cancelaste la autenticación con Google.',
  server_error: 'Ocurrió un error en el servidor. Por favor intentá de nuevo.',
};

export default function ErrorPage() {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason') || 'server_error';
  const message = ERROR_MESSAGES[reason] || ERROR_MESSAGES.server_error;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>❌</div>
        <h1 className={styles.title}>Error de autenticación</h1>
        <p className={styles.message}>{message}</p>
        <a href="/" className={styles.button}>
          Volver a intentar
        </a>
      </div>
    </div>
  );
}
