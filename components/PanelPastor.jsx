import { useEffect, useState } from 'react';
import { useApi, apiFetch } from './useApi.js';
import GraficoColumnas from './panel/GraficoColumnas.jsx';
import ResumenSemanal from './panel/ResumenSemanal.jsx';
import WhatsAppConfig from './panel/WhatsAppConfig.jsx';

const pct = (v) => `${v}%`;
const fecha = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });

/** Panel general de la iglesia para el pastor (solo administradores). */
export default function PanelPastor() {
  const { getUrl } = useApi();
  const [panel, setPanel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch(getUrl('/panel-pastor'))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('No se pudo cargar el panel'))))
      .then(setPanel)
      .catch((e) => setError(e.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p className="text-rose-600">{error}</p>;
  if (!panel) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>Cargando panel…
      </div>
    );
  }

  const { miembros, crecimiento, tcd, asistencia } = panel;
  const difNuevos = crecimiento.nuevosEsteMes - crecimiento.nuevosMesAnterior;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-chart-line text-indigo-500" aria-hidden="true"></i>Panel pastoral
        </h2>
        <p className="text-sm text-slate-500">Cómo va la iglesia: miembros, Tiempo con Dios, asistencia y crecimiento.</p>
      </div>

      {/* Indicadores principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Indicador titulo="Miembros activos" valor={miembros.activos} icono="fa-users"
          detalle={`${miembros.porRol.SERVIDOR} servidores · ${miembros.porRol.ADMIN} admin · ${miembros.porRol.USUARIO} usuarios`} />
        <Indicador titulo="Nuevos este mes" valor={crecimiento.nuevosEsteMes} icono="fa-user-plus"
          detalle={difNuevos === 0 ? 'Igual que el mes pasado' : `${difNuevos > 0 ? '▲' : '▼'} ${Math.abs(difNuevos)} vs. mes pasado`} />
        <Indicador titulo="TCD del mes" valor={pct(tcd.cumplimientoMes)} icono="fa-book-open"
          detalle={`${tcd.participantes} participantes · ${tcd.subieronHoy} subieron hoy`} />
        <Indicador titulo="Asistencia del mes" valor={pct(asistencia.porcentajeAsistencia)} icono="fa-calendar-check"
          detalle={`${asistencia.turnos} turnos · ${asistencia.noPuede} avisaron que no podían`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoColumnas titulo="Cumplimiento de TCD por semana" descripcion="% de días con TCD de quienes participan (últimas 8 semanas)"
          datos={tcd.cumplimientoPorSemana} formato={pct} maximo={100} />
        <GraficoColumnas titulo="Cumplimiento de TCD por mes" descripcion="Últimos 6 meses"
          datos={tcd.cumplimientoPorMes} formato={pct} maximo={100} />
        <GraficoColumnas titulo="Asistencia a turnos por mes" descripcion="% de presentes entre los turnos con asistencia registrada"
          datos={asistencia.asistenciaPorMes} formato={pct} maximo={100} />
        <GraficoColumnas titulo="Personas nuevas por mes" descripcion={`Últimos 12 meses${crecimiento.personasSinFechaDeLlegada ? ` · ${crecimiento.personasSinFechaDeLlegada} personas sin fecha de llegada no se cuentan` : ''}`}
          datos={crecimiento.nuevosPorMes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Lista titulo="Sin TCD en los últimos 7 días" icono="fa-book-open" vacio="Todos los participantes están al día."
          items={tcd.sinTcdUltimos7Dias.map((p) => ({ clave: p.id, texto: p.nombre }))} />
        <Lista titulo="Cumpleaños próximos (7 días)" icono="fa-cake-candles" vacio="No hay cumpleaños esta semana."
          items={panel.cumpleanosProximos.map((p) => ({ clave: p.id, texto: p.nombre, extra: fecha(p.fecha) }))} />
        <Lista titulo="Ausencias avisadas (próximos 14 días)" icono="fa-user-xmark" vacio="Nadie ha avisado ausencias."
          items={panel.ausenciasProximas.map((a) => ({ clave: a.idServicio, texto: a.nombre, extra: fecha(a.fecha), nota: a.motivo }))} />
      </div>

      <ResumenSemanal />
      <WhatsAppConfig />
    </div>
  );
}

function Indicador({ titulo, valor, icono, detalle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
        <i className={`fas ${icono} text-slate-400`} aria-hidden="true"></i>{titulo}
      </p>
      <p className="text-3xl sm:text-4xl font-black text-slate-800 mt-2 tabular-nums">{valor}</p>
      <p className="text-xs text-slate-500 mt-1">{detalle}</p>
    </div>
  );
}

function Lista({ titulo, icono, items, vacio }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-bold text-slate-800 mb-3"><i className={`fas ${icono} mr-2 text-slate-400`} aria-hidden="true"></i>{titulo}
        <span className="ml-1 text-slate-400 font-semibold">({items.length})</span></h3>
      {items.length === 0 ? <p className="text-sm text-slate-400">{vacio}</p> : (
        <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {items.map((i) => (
            <li key={i.clave} className="py-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-700 font-semibold">{i.texto}</span>
                {i.extra && <span className="text-slate-500 capitalize whitespace-nowrap">{i.extra}</span>}
              </div>
              {i.nota && <p className="text-xs text-slate-500 mt-0.5">“{i.nota}”</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
