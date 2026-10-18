import { useEffect, useState } from 'react';
import { useApi, apiFetch } from '../useApi.js';

const fecha = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

function Tendencia({ actual, anterior }) {
  if (actual == null || anterior == null) return null;
  const dif = actual - anterior;
  if (dif === 0) return <span className="text-xs text-slate-500 ml-2">= igual</span>;
  return (
    <span className={`text-xs font-bold ml-2 ${dif > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
      <i className={`fas ${dif > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-0.5`} aria-hidden="true"></i>{Math.abs(dif)} pts
    </span>
  );
}

function ListaNombres({ titulo, icono, personas, vacio, detalle }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-700 mb-2"><i className={`fas ${icono} mr-2 text-slate-400`} aria-hidden="true"></i>{titulo} ({personas.length})</p>
      {personas.length === 0 ? <p className="text-sm text-slate-400">{vacio}</p> : (
        <ul className="flex flex-wrap gap-1.5">
          {personas.map((p, i) => (
            <li key={`${p.id}-${i}`} className="text-xs bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-slate-700">
              {p.nombre}{detalle ? detalle(p) : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Resumen semanal: el último generado y los anteriores. */
export default function ResumenSemanal() {
  const { getUrl } = useApi();
  const [resumenes, setResumenes] = useState([]);
  const [indice, setIndice] = useState(0);
  const [generando, setGenerando] = useState(false);

  const cargar = () => apiFetch(getUrl('/panel-pastor/resumenes'))
    .then((r) => (r.ok ? r.json() : [])).then((l) => { setResumenes(l); setIndice(0); }).catch(() => {});

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generar = async () => {
    setGenerando(true);
    await apiFetch(getUrl('/panel-pastor/resumenes/generar'), { method: 'POST' });
    await cargar();
    setGenerando(false);
  };

  const r = resumenes[indice];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800"><i className="fas fa-newspaper mr-2 text-indigo-500" aria-hidden="true"></i>Resumen semanal</h3>
          <p className="text-xs text-slate-500">Se genera solo cada lunes a las 7:00 a. m. y llega a los administradores.</p>
        </div>
        <div className="flex items-center gap-2">
          {resumenes.length > 1 && (
            <select value={indice} onChange={(e) => setIndice(Number(e.target.value))}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
              {resumenes.map((x, i) => <option key={x.semanaInicio} value={i}>Semana del {fecha(x.semanaInicio)}</option>)}
            </select>
          )}
          <button onClick={generar} disabled={generando}
            className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60">
            <i className={`fas fa-rotate mr-2 ${generando ? 'fa-spin' : ''}`} aria-hidden="true"></i>Generar ahora
          </button>
        </div>
      </div>

      {!r ? (
        <p className="text-sm text-slate-400">Aún no hay resúmenes. Toca “Generar ahora” para ver el de la semana pasada.</p>
      ) : (
        <>
          <p className="text-sm text-slate-600">Semana del <strong>{fecha(r.semanaInicio)}</strong> al <strong>{fecha(r.semanaFin)}</strong></p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-semibold">Cumplimiento TCD</p>
              <p className="text-2xl font-black text-slate-800">{r.tcdPorcentaje}%<Tendencia actual={r.tcdPorcentaje} anterior={r.tcdPorcentajeAnterior} /></p>
              <p className="text-xs text-slate-500">{r.tcdParticipantes} participantes</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-semibold">Asistencia a turnos</p>
              <p className="text-2xl font-black text-slate-800">{r.asistencia.porcentajeAsistencia}%
                <Tendencia actual={r.asistencia.porcentajeAsistencia} anterior={r.asistenciaAnterior.porcentajeAsistencia} /></p>
              <p className="text-xs text-slate-500">{r.asistencia.turnos} turnos · {r.asistencia.sinRegistro} sin registrar</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-semibold">Próxima semana</p>
              <p className="text-2xl font-black text-slate-800">{r.proximaSemana.turnos} <span className="text-sm font-semibold text-slate-500">turnos</span></p>
              <p className="text-xs text-slate-500">{r.proximaSemana.pendientes} sin confirmar · {r.proximaSemana.noPuede} no pueden</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ListaNombres titulo="Sin TCD en la semana" icono="fa-book-open" personas={r.sinTcd} vacio="¡Todos subieron al menos un TCD!" />
            <ListaNombres titulo="Faltaron o avisaron que no podían" icono="fa-user-xmark" personas={r.faltaron} vacio="Nadie faltó."
              detalle={(p) => ` · ${fecha(p.fecha)}${p.tipo === 'AVISO_NO_PUEDE' ? ' (avisó)' : ''}`} />
            <ListaNombres titulo="Cumpleaños de esta semana" icono="fa-cake-candles" personas={r.cumpleanos} vacio="No hay cumpleaños."
              detalle={(p) => ` · ${fecha(p.fecha)}`} />
            <ListaNombres titulo="Personas nuevas" icono="fa-user-plus" personas={r.nuevos} vacio="Sin registros nuevos." />
          </div>
        </>
      )}
    </section>
  );
}
