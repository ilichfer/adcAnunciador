import { useEffect, useState, useCallback } from 'react';
import { useApi, apiFetch } from '../useApi.js';

const PREFERENCIAS = [
  ['WA_CUMPLEANOS', 'Saludo de cumpleaños', 'Cada día a las 8:00 a. m. a quien cumple años.'],
  ['WA_RECORDATORIO_TCD', 'Recordatorio de TCD', 'A las 7:00 p. m. a quien aún no sube su TCD (solo participantes activos).'],
  ['WA_AUSENCIAS', 'Aviso de ausencias', 'Al coordinador del día cuando alguien avisa que no puede servir.'],
  ['WA_RESUMEN_SEMANAL', 'Resumen semanal', 'Los lunes a las 7:00 a. m. a los administradores.'],
];

const ESTADOS = {
  CONECTADO: ['Conectado', 'text-emerald-700 bg-emerald-50 border-emerald-200', 'fa-circle-check'],
  DESCONECTADO: ['Desconectado', 'text-amber-800 bg-amber-50 border-amber-200', 'fa-plug-circle-xmark'],
  SIN_INSTANCIA: ['Sin vincular', 'text-amber-800 bg-amber-50 border-amber-200', 'fa-link-slash'],
  NO_CONFIGURADO: ['No configurado en el servidor', 'text-slate-600 bg-slate-50 border-slate-200', 'fa-gear'],
  ERROR: ['Sin respuesta del servidor de WhatsApp', 'text-rose-700 bg-rose-50 border-rose-200', 'fa-triangle-exclamation'],
};

/** Conexión del WhatsApp de la iglesia y activación de los envíos automáticos. */
export default function WhatsAppConfig() {
  const { getUrl } = useApi();
  const [estado, setEstado] = useState(null);
  const [qr, setQr] = useState(null);
  const [numeroPrueba, setNumeroPrueba] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(() => {
    apiFetch(getUrl('/whatsapp/estado')).then((r) => (r.ok ? r.json() : null)).then(setEstado).catch(() => setEstado(null));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargar(); }, [cargar]);

  // Mientras se muestra el QR, revisar cada 5 s si ya se vinculó
  useEffect(() => {
    if (!qr) return undefined;
    const t = setInterval(() => {
      apiFetch(getUrl('/whatsapp/estado')).then((r) => r.json()).then((e) => {
        setEstado(e);
        if (e.estado === 'CONECTADO') setQr(null);
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  }, [qr]); // eslint-disable-line react-hooks/exhaustive-deps

  const conectar = async () => {
    setOcupado(true);
    setMensaje(null);
    try {
      const r = await apiFetch(getUrl('/whatsapp/conectar'), { method: 'POST' });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      if (data.qr) {
        setQr(data.qr);
      } else if (data.estado === 'CONECTADO') {
        cargar();
      } else {
        setMensaje({ ok: false, texto: 'WhatsApp todavía está preparando el código. Espera unos segundos y vuelve a tocar “Mostrar código QR”.' });
        cargar();
      }
    } catch (e) {
      setMensaje({ ok: false, texto: e.message || 'No se pudo generar el código QR' });
    } finally {
      setOcupado(false);
    }
  };

  const cambiarPreferencia = async (clave, valor) => {
    const r = await apiFetch(getUrl('/whatsapp/preferencias'), { method: 'PUT', body: JSON.stringify({ [clave]: valor }) });
    if (r.ok) {
      const preferencias = await r.json();
      setEstado((e) => ({ ...e, preferencias }));
    }
  };

  const enviarPrueba = async () => {
    setOcupado(true);
    setMensaje(null);
    const r = await apiFetch(getUrl('/whatsapp/prueba'), { method: 'POST', body: JSON.stringify({ numero: numeroPrueba }) });
    setMensaje({ ok: r.ok, texto: await r.text() });
    setOcupado(false);
  };

  if (!estado) return null;
  const [etiqueta, clases, icono] = ESTADOS[estado.estado] || ESTADOS.ERROR;
  const conectado = estado.estado === 'CONECTADO';

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fab fa-whatsapp text-emerald-600 text-xl" aria-hidden="true"></i>WhatsApp de la iglesia
        </h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${clases}`}>
          <i className={`fas ${icono} mr-1`} aria-hidden="true"></i>{etiqueta}
        </span>
      </div>

      {!conectado && estado.estado !== 'NO_CONFIGURADO' && (
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 space-y-3">
          <p>Vincula el número de WhatsApp de la iglesia una sola vez:</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Toca <strong>“Mostrar código QR”</strong>.</li>
            <li>En el celular de la iglesia abre WhatsApp → <strong>Dispositivos vinculados</strong> → <strong>Vincular un dispositivo</strong>.</li>
            <li>Escanea el código. Esta página se actualiza sola cuando quede conectado.</li>
          </ol>
          {qr ? (
            <div className="flex flex-col items-center gap-2 pt-2">
              <img src={qr} alt="Código QR para vincular WhatsApp" className="w-56 h-56 bg-white p-2 rounded-xl border border-slate-200" />
              <button onClick={conectar} disabled={ocupado} className="text-xs font-semibold text-indigo-700 underline">El código venció: generar otro</button>
            </div>
          ) : (
            <button onClick={conectar} disabled={ocupado}
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-60">
              <i className="fas fa-qrcode mr-2" aria-hidden="true"></i>{ocupado ? 'Generando…' : 'Mostrar código QR'}
            </button>
          )}
        </div>
      )}

      <div>
        <p className="text-sm font-bold text-slate-700 mb-1">Envíos automáticos por WhatsApp</p>
        <p className="text-xs text-slate-500 mb-3">
          Las notificaciones dentro de la app y en el celular (push) siempre se envían. Aquí decides qué se envía además por WhatsApp.
        </p>
        <ul className="space-y-2">
          {PREFERENCIAS.map(([clave, nombre, detalle]) => {
            const activo = !!estado.preferencias?.[clave];
            return (
              <li key={clave} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{nombre}</p>
                  <p className="text-xs text-slate-500">{detalle}</p>
                </div>
                <button role="switch" aria-checked={activo} aria-label={nombre} onClick={() => cambiarPreferencia(clave, !activo)}
                  className={`relative w-12 h-7 shrink-0 rounded-full transition-colors ${activo ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${activo ? 'left-6' : 'left-1'}`} />
                </button>
              </li>
            );
          })}
        </ul>
        {!conectado && <p className="text-xs text-amber-700 mt-2">Mientras WhatsApp no esté conectado, estos envíos no salen.</p>}
      </div>

      {conectado && (
        <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-500 uppercase">Probar con un celular
            <input value={numeroPrueba} onChange={(e) => setNumeroPrueba(e.target.value)} inputMode="tel" placeholder="3001234567"
              className="block mt-1 h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal" />
          </label>
          <button onClick={enviarPrueba} disabled={ocupado || !numeroPrueba}
            className="h-10 px-4 rounded-xl bg-slate-800 text-white text-sm font-bold disabled:opacity-50">Enviar prueba</button>
        </div>
      )}
      {mensaje && <p className={`text-sm font-semibold ${mensaje.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{mensaje.texto}</p>}
    </section>
  );
}
