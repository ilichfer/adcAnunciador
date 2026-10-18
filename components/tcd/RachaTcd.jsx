import { useEffect, useState } from 'react';
import { useApi, apiFetch } from '../useApi.js';

/** Racha de días seguidos con TCD e insignias ganadas. */
export default function RachaTcd({ idPersona, recargar }) {
  const { getUrl } = useApi();
  const [racha, setRacha] = useState(null);

  useEffect(() => {
    if (!idPersona) return;
    apiFetch(getUrl(`/tcd/racha/${idPersona}`))
      .then((r) => (r.ok ? r.json() : null))
      .then(setRacha)
      .catch(() => setRacha(null));
  }, [idPersona, recargar]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!racha) return null;

  const enRiesgo = racha.rachaActual > 0 && !racha.subidoHoy;
  const ganadas = racha.insignias.filter((i) => i.obtenida).length;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div className="grid grid-cols-3 gap-3 text-center">
        <Dato valor={racha.rachaActual} etiqueta={racha.rachaActual === 1 ? 'día seguido' : 'días seguidos'}
          icono="fa-fire" destacado />
        <Dato valor={racha.mejorRacha} etiqueta="mejor racha" icono="fa-trophy" />
        <Dato valor={`${racha.totalMes}/${racha.diasMesTranscurridos}`} etiqueta="este mes" icono="fa-calendar-check" />
      </div>

      {racha.subidoHoy ? (
        <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
          <i className="fas fa-circle-check mr-2" aria-hidden="true"></i>¡Ya subiste tu TCD de hoy! Sigue así.
        </p>
      ) : enRiesgo ? (
        <p className="text-sm font-semibold text-amber-800 bg-amber-50 rounded-xl px-4 py-3">
          <i className="fas fa-fire mr-2" aria-hidden="true"></i>Sube tu TCD hoy para no perder tu racha de {racha.rachaActual} días.
        </p>
      ) : null}

      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Insignias ({ganadas} de {racha.insignias.length})</p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {racha.insignias.map((i) => (
            <li key={i.codigo}
              className={`rounded-xl border p-3 ${i.obtenida ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center ${i.obtenida ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <i className={`fas ${i.icono}`} aria-hidden="true"></i>
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${i.obtenida ? 'text-slate-800' : 'text-slate-500'}`}>{i.nombre}</p>
                  <p className="text-[11px] text-slate-500">
                    {i.obtenida ? <><i className="fas fa-check mr-1" aria-hidden="true"></i>Obtenida</> : `${i.progreso} de ${i.meta}`}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">{i.descripcion}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Dato({ valor, etiqueta, icono, destacado }) {
  return (
    <div className={`rounded-2xl p-3 ${destacado ? 'bg-orange-50' : 'bg-slate-50'}`}>
      <i className={`fas ${icono} ${destacado ? 'text-orange-500' : 'text-slate-400'} mb-1`} aria-hidden="true"></i>
      <p className="text-2xl sm:text-3xl font-black text-slate-800">{valor}</p>
      <p className="text-xs text-slate-500">{etiqueta}</p>
    </div>
  );
}
