import React from 'react';
import styles from './Login.module.css';

export default function Login() {
  const params = new URLSearchParams(window.location.search);
  const telegramId = params.get('telegramId');

  const authUrl = telegramId
    ? `${process.env.REACT_APP_BACKEND_URL}/auth/start?telegramId=${telegramId}`
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>📅</div>

        <h1 className={styles.title}>CalendarBot</h1>
        <p className={styles.subtitle}>
          Asistente inteligente de calendario por Telegram
        </p>

        <div className={styles.features}>
          <FeatureItem icon="🤖" text="Gestioná tu calendario en lenguaje natural" />
          <FeatureItem icon="⚡" text="Detección automática de conflictos de horario" />
          <FeatureItem icon="📚" text="Planes de estudio organizados inteligentemente" />
        </div>

        {authUrl ? (
          <a href={authUrl} className={styles.button}>
            <GoogleIcon />
            Conectar con Google Calendar
          </a>
        ) : (
          <div className={styles.warning}>
            <p>Abrí este link desde el bot de Telegram para conectar tu cuenta.</p>
            <p className={styles.hint}>Buscá <strong>@CalendarBot</strong> en Telegram y escribí /start</p>
          </div>
        )}

        <p className={styles.privacy}>
          Solo accedemos a tu calendario. No compartimos tu información.
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{ fontSize: '14px', color: '#94a3b8' }}>{text}</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '8px' }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
