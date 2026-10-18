// Utilidades de la app instalable (PWA) y de las notificaciones push.
import { API_BASE, apiFetch } from './useApi.js';

export const INSTALL_EVENT = 'adc:instalable';
let installPrompt = null;

/** Registra el service worker (solo en producción) y escucha el aviso de "instalar app". */
export function iniciarPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    window.dispatchEvent(new Event(INSTALL_EVENT));
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    window.dispatchEvent(new Event(INSTALL_EVENT));
  });
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {});
    });
  }
}

export const puedeInstalar = () => installPrompt !== null;

export async function instalarApp() {
  if (!installPrompt) return false;
  installPrompt.prompt();
  const { outcome } = await installPrompt.userChoice;
  installPrompt = null;
  window.dispatchEvent(new Event(INSTALL_EVENT));
  return outcome === 'accepted';
}

export const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
export const estaInstalada = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

/** El navegador permite push (en iPhone solo dentro de la app instalada). */
export const pushSoportado = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

async function suscripcionActual() {
  if (!pushSoportado()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

/** 'no-soportado' | 'bloqueado' | 'activo' | 'inactivo' */
export async function estadoPush() {
  if (!pushSoportado()) return 'no-soportado';
  if (Notification.permission === 'denied') return 'bloqueado';
  const sub = await suscripcionActual();
  return sub && Notification.permission === 'granted' ? 'activo' : 'inactivo';
}

function claveABytes(base64) {
  const relleno = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Pide permiso, suscribe este dispositivo y lo registra en el servidor. */
export async function activarPush() {
  if (!pushSoportado()) throw new Error('Este navegador no permite notificaciones.');
  const conf = await apiFetch(`${API_BASE}/push/configuracion`).then((r) => (r.ok ? r.json() : null));
  if (!conf?.activo || !conf.clavePublica) throw new Error('Las notificaciones aún no están disponibles.');

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') throw new Error('No diste permiso para mostrar notificaciones.');

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: claveABytes(conf.clavePublica),
    });
  }
  const res = await apiFetch(`${API_BASE}/push/suscripcion`, {
    method: 'POST',
    body: JSON.stringify(sub.toJSON()),
  });
  if (!res.ok) throw new Error('No se pudo guardar la suscripción.');
}

/** Quita la suscripción de este dispositivo (al desactivar o al cerrar sesión). */
export async function desactivarPush() {
  const sub = await suscripcionActual().catch(() => null);
  if (!sub) return;
  await apiFetch(`${API_BASE}/push/suscripcion`, {
    method: 'DELETE',
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}
