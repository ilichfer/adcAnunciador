import { useEffect, useState, useCallback } from 'react';
import {
  INSTALL_EVENT, puedeInstalar, instalarApp, esIOS, estaInstalada,
  estadoPush, activarPush, desactivarPush,
} from './pwa.js';

const DESCARTADO = 'adc_aviso_dispositivo_descartado';

const leerDescartado = () => {
  try { return localStorage.getItem(DESCARTADO) === '1'; } catch { return false; }
};

/**
 * Invita a instalar la app y a activar las notificaciones en este celular o computador.
 * - modo "aviso" (por defecto): tarjeta arriba del contenido que se puede cerrar.
 * - modo "perfil": tarjeta fija dentro de Mi Perfil para activar o desactivar cuando se quiera.
 */
export default function NotificacionesDispositivo({ modo = 'aviso' }) {
  const [push, setPush] = useState('cargando');
  const [instalable, setInstalable] = useState(puedeInstalar());
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [descartado, setDescartado] = useState(leerDescartado);

  const refrescar = useCallback(() => {
    estadoPush().then(setPush).catch(() => setPush('no-soportado'));
    setInstalable(puedeInstalar());
  }, []);

  useEffect(() => {
    refrescar();
    window.addEventListener(INSTALL_EVENT, refrescar);
    return () => window.removeEventListener(INSTALL_EVENT, refrescar);
  }, [refrescar]);

  const activar = async () => {
    setOcupado(true);
    setMensaje(null);
    try {
      await activarPush();
      setMensaje({ ok: true, texto: '¡Listo! Te avisaremos de tus turnos, tu TCD y los cumpleaños.' });
    } catch (e) {
      setMensaje({ ok: false, texto: e.message });
    } finally {
      setOcupado(false);
      refrescar();
    }
  };

  const desactivar = async () => {
    setOcupado(true);
    await desactivarPush();
    setOcupado(false);
    setMensaje(null);
    refrescar();
  };

  const descartar = () => {
    try { localStorage.setItem(DESCARTADO, '1'); } catch { /* sin almacenamiento: solo se oculta ahora */ }
    setDescartado(true);
  };

  const iosSinInstalar = esIOS() && !estaInstalada();
  const faltaPush = push === 'inactivo';
  const mostrarInstalar = instalable || iosSinInstalar;

  if (push === 'cargando') return null;
  if (modo === 'aviso' && (descartado || (!faltaPush && !mostrarInstalar) || (mensaje?.ok && !mostrarInstalar))) {
    return mensaje?.ok ? <Exito texto={mensaje.texto} /> : null;
  }

  return (
    <div className={`mb-6 rounded-2xl border p-5 ${modo === 'aviso' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl">
          <i className="fas fa-bell" aria-hidden="true"></i>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-lg">
            {modo === 'perfil' ? 'Notificaciones en este dispositivo' : 'Recibe los avisos en tu celular'}
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            Te avisamos cuando te asignen un turno, si olvidas tu TCD y en los cumpleaños.
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            {faltaPush && !iosSinInstalar && (
              <button onClick={activar} disabled={ocupado}
                className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 disabled:opacity-60">
                <i className="fas fa-bell mr-2" aria-hidden="true"></i>
                {ocupado ? 'Activando…' : 'Activar notificaciones'}
              </button>
            )}
            {instalable && (
              <button onClick={() => instalarApp().then(refrescar)}
                className="px-5 py-3 rounded-xl bg-white text-indigo-700 border-2 border-indigo-200 font-bold text-base hover:bg-indigo-50">
                <i className="fas fa-mobile-screen mr-2" aria-hidden="true"></i>Instalar la app
              </button>
            )}
            {modo === 'perfil' && push === 'activo' && (
              <button onClick={desactivar} disabled={ocupado}
                className="px-5 py-3 rounded-xl bg-white text-slate-600 border border-slate-200 font-bold text-sm hover:bg-slate-50">
                Desactivar en este dispositivo
              </button>
            )}
            {modo === 'aviso' && (
              <button onClick={descartar} className="px-4 py-3 rounded-xl text-slate-500 font-semibold text-sm hover:bg-white/60">
                Ahora no
              </button>
            )}
          </div>

          {iosSinInstalar && (
            <p className="mt-4 text-sm text-slate-700 bg-white rounded-xl p-3 border border-slate-200">
              <strong>En iPhone:</strong> toca <i className="fas fa-arrow-up-from-bracket mx-1" aria-hidden="true"></i>
              <strong>Compartir</strong> y luego <strong>“Agregar a pantalla de inicio”</strong>.
              Abre la app desde ese ícono para poder activar las notificaciones.
            </p>
          )}
          {modo === 'perfil' && push === 'activo' && (
            <p className="mt-3 text-sm text-emerald-700 font-semibold">
              <i className="fas fa-circle-check mr-1" aria-hidden="true"></i>Las notificaciones están activas aquí.
            </p>
          )}
          {push === 'bloqueado' && (
            <p className="mt-3 text-sm text-amber-700">
              Las notificaciones están bloqueadas en este navegador. Actívalas desde el candado junto a la dirección web.
            </p>
          )}
          {push === 'no-soportado' && !iosSinInstalar && modo === 'perfil' && (
            <p className="mt-3 text-sm text-slate-500">Este navegador no permite notificaciones.</p>
          )}
          {mensaje && (
            <p className={`mt-3 text-sm font-semibold ${mensaje.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{mensaje.texto}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Exito({ texto }) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800 font-semibold text-sm">
      <i className="fas fa-circle-check mr-2" aria-hidden="true"></i>{texto}
    </div>
  );
}

