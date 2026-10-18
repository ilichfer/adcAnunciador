import { useState } from 'react';
import { useApi, apiFetch } from './useApi.js';

/** Etiqueta del estado de confirmación de un turno (con ícono, no solo color). */
export function EstadoConfirmacion({ estado }) {
  if (estado === 'CONFIRMADO') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <i className="fas fa-circle-check" aria-hidden="true"></i> Confirmado
      </span>
    );
  }
  if (estado === 'NO_PUEDE') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
        <i className="fas fa-circle-xmark" aria-hidden="true"></i> No puede
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
      <i className="fas fa-clock" aria-hidden="true"></i> Sin confirmar
    </span>
  );
}

/**
 * Botones para que el servidor confirme su turno o avise que no puede.
 * Si no puede, se le pide un motivo opcional y se avisa al coordinador.
 */
export default function ConfirmarTurno({ idServicio, estado, onCambio }) {
  const { getUrl } = useApi();
  const [pidiendoMotivo, setPidiendoMotivo] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState(null);

  if (!idServicio) return null;

  const responder = async (nuevoEstado, motivoEnviado) => {
    setOcupado(true);
    setError(null);
    try {
      const res = await apiFetch(getUrl(`/servicios/${idServicio}/confirmacion`), {
        method: 'PUT',
        body: JSON.stringify({ estado: nuevoEstado, motivo: motivoEnviado || null }),
      });
      if (!res.ok) throw new Error((await res.text()) || 'No se pudo guardar tu respuesta');
      const data = await res.json();
      setPidiendoMotivo(false);
      setMotivo('');
      onCambio?.(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(false);
    }
  };

  if (pidiendoMotivo) {
    return (
      <div className="mt-3 space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          ¿Por qué no puedes? <span className="font-normal text-slate-400">(opcional)</span>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={300} rows={2}
            className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-rose-300"
            placeholder="Ej: estoy de viaje" />
        </label>
        <div className="flex gap-2">
          <button onClick={() => responder('NO_PUEDE', motivo.trim())} disabled={ocupado}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 disabled:opacity-60">
            {ocupado ? 'Enviando…' : 'Avisar al coordinador'}
          </button>
          <button onClick={() => setPidiendoMotivo(false)} disabled={ocupado}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        {estado !== 'CONFIRMADO' && (
          <button onClick={() => responder('CONFIRMADO')} disabled={ocupado}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-60">
            <i className="fas fa-check mr-1" aria-hidden="true"></i>{ocupado ? '…' : 'Sí puedo'}
          </button>
        )}
        {estado !== 'NO_PUEDE' && (
          <button onClick={() => setPidiendoMotivo(true)} disabled={ocupado}
            className="flex-1 py-2.5 rounded-xl bg-white text-rose-700 border border-rose-200 font-bold text-sm hover:bg-rose-50 disabled:opacity-60">
            <i className="fas fa-xmark mr-1" aria-hidden="true"></i>No puedo
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
