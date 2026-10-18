import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi, apiFetch } from './useApi.js';
import ConfirmarTurno, { EstadoConfirmacion } from './ConfirmarTurno.jsx';
import { descargarIcs, urlGoogle } from './calendario/ics.js';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hoyIso = () => iso(new Date());
const lunesDe = (d) => {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
};
const sumarDias = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

/** Días que muestra la vista: semanas completas del mes, o una sola semana. */
function rangoVista(vista, referencia) {
  if (vista === 'semana') {
    const inicio = lunesDe(referencia);
    return Array.from({ length: 7 }, (_, i) => sumarDias(inicio, i));
  }
  const primero = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
  const ultimo = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);
  const inicio = lunesDe(primero);
  const dias = [];
  for (let d = inicio; d <= ultimo || dias.length % 7 !== 0; d = sumarDias(d, 1)) dias.push(d);
  return dias;
}

const colorEvento = (e) => (
  e.confirmacion === 'NO_PUEDE' ? 'bg-rose-50 text-rose-800 border-rose-200 line-through decoration-rose-300'
    : e.confirmacion === 'CONFIRMADO' ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : e.propio ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
        : 'bg-slate-50 text-slate-700 border-slate-200'
);

export default function Calendario() {
  const { isAdmin, isServidor } = useAuth();
  const { getUrl } = useApi();
  const puedeVerTodos = isAdmin || isServidor;

  const [vista, setVista] = useState(() => (window.innerWidth < 640 ? 'semana' : 'mes'));
  const [referencia, setReferencia] = useState(new Date());
  const [todos, setTodos] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [diaAbierto, setDiaAbierto] = useState(null);
  const [suscripcion, setSuscripcion] = useState(null);

  const dias = useMemo(() => rangoVista(vista, referencia), [vista, referencia]);
  const desde = iso(dias[0]);
  const hasta = iso(dias[dias.length - 1]);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    apiFetch(getUrl(`/calendario?desde=${desde}&hasta=${hasta}&todos=${todos}`))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('No se pudo cargar el calendario'))))
      .then(setEventos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [desde, hasta, todos]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargar(); }, [cargar]);

  const porDia = useMemo(() => {
    const m = {};
    for (const e of eventos) (m[e.fecha] ||= []).push(e);
    return m;
  }, [eventos]);

  const mover = (paso) => {
    const r = new Date(referencia);
    if (vista === 'semana') r.setDate(r.getDate() + 7 * paso);
    else r.setMonth(r.getMonth() + paso, 1);
    setReferencia(r);
  };

  const tituloPeriodo = vista === 'semana'
    ? `${dias[0].toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} – ${dias[6].toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : referencia.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  const verSuscripcion = async () => {
    const r = await apiFetch(getUrl('/calendario/suscripcion'));
    if (r.ok) setSuscripcion(await r.json());
  };

  const actualizarEvento = (data) => {
    setEventos((prev) => prev.map((e) => (e.idServicio === data.idServicio
      ? { ...e, confirmacion: data.confirmacion, motivoConfirmacion: data.motivoConfirmacion } : e)));
    setSeleccionado((s) => (s && s.idServicio === data.idServicio
      ? { ...s, confirmacion: data.confirmacion, motivoConfirmacion: data.motivoConfirmacion } : s));
  };

  const misEventos = eventos.filter((e) => e.propio);
  const hoy = hoyIso();

  return (
    <div className="space-y-6">
      {/* Encabezado y controles en una sola fila */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-calendar-days text-indigo-500" aria-hidden="true"></i>
            <span className="capitalize">{tituloPeriodo}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => mover(-1)} aria-label="Anterior" className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50">
              <i className="fas fa-chevron-left" aria-hidden="true"></i>
            </button>
            <button onClick={() => setReferencia(new Date())} className="px-4 h-10 rounded-xl border border-slate-200 font-semibold text-sm hover:bg-slate-50">Hoy</button>
            <button onClick={() => mover(1)} aria-label="Siguiente" className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50">
              <i className="fas fa-chevron-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmento opciones={[['mes', 'Mes'], ['semana', 'Semana']]} valor={vista} onChange={setVista} />
          {puedeVerTodos && (
            <Segmento opciones={[[false, 'Mis turnos'], [true, 'Toda la iglesia']]} valor={todos} onChange={setTodos} />
          )}
          <div className="flex-1" />
          <button onClick={() => descargarIcs(todos ? eventos : misEventos, 'mis-turnos.ics')}
            disabled={!(todos ? eventos : misEventos).length}
            className="px-4 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <i className="fas fa-download mr-2" aria-hidden="true"></i>Descargar .ics
          </button>
          <button onClick={verSuscripcion}
            className="px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">
            <i className="fab fa-google mr-2" aria-hidden="true"></i>Sincronizar con Google Calendar
          </button>
        </div>

        {suscripcion && <PanelSuscripcion datos={suscripcion} onCerrar={() => setSuscripcion(null)} onRegenerar={async () => {
          const r = await apiFetch(getUrl('/calendario/suscripcion/regenerar'), { method: 'POST' });
          if (r.ok) setSuscripcion(await r.json());
        }} />}

        <Leyenda />
      </div>

      {error && <p className="text-rose-600 text-sm">{error}</p>}

      {vista === 'mes' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {DIAS.map((d) => <div key={d} className="py-2 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>)}
          </div>
          <div className={`grid grid-cols-7 ${cargando ? 'opacity-50' : ''}`}>
            {dias.map((d) => {
              const clave = iso(d);
              const lista = porDia[clave] || [];
              const fuera = d.getMonth() !== referencia.getMonth();
              return (
                <button key={clave} onClick={() => setDiaAbierto(lista.length ? clave : null)}
                  className={`min-h-[84px] sm:min-h-[110px] p-1.5 text-left border-b border-r border-slate-100 align-top hover:bg-indigo-50/40 ${fuera ? 'bg-slate-50/60' : ''}`}>
                  <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-bold ${clave === hoy ? 'bg-indigo-600 text-white' : fuera ? 'text-slate-300' : 'text-slate-700'}`}>
                    {d.getDate()}
                  </span>
                  <div className="mt-1 space-y-1 hidden sm:block">
                    {lista.slice(0, 3).map((e) => (
                      <div key={e.idServicio} className={`truncate text-[11px] font-semibold px-1.5 py-0.5 rounded-md border ${colorEvento(e)}`}>
                        {todos ? e.persona.split(' ')[0] + ' · ' : ''}{e.posicion}
                      </div>
                    ))}
                    {lista.length > 3 && <div className="text-[11px] text-slate-500 font-semibold">+{lista.length - 3} más</div>}
                  </div>
                  {lista.length > 0 && (
                    <div className="sm:hidden mt-1 text-[11px] font-bold text-indigo-700">{lista.length} turno{lista.length > 1 ? 's' : ''}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={`space-y-3 ${cargando ? 'opacity-50' : ''}`}>
          {dias.map((d) => {
            const clave = iso(d);
            const lista = porDia[clave] || [];
            return (
              <div key={clave} className={`bg-white rounded-2xl border p-4 ${clave === hoy ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
                <p className="font-bold text-slate-800 capitalize">
                  {d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {clave === hoy && <span className="ml-2 text-xs font-bold text-indigo-600">HOY</span>}
                </p>
                {lista.length === 0
                  ? <p className="text-sm text-slate-400 mt-1">Sin turnos</p>
                  : <ListaEventos eventos={lista} todos={todos} onElegir={setSeleccionado} />}
              </div>
            );
          })}
        </div>
      )}

      {diaAbierto && (
        <Modal onCerrar={() => setDiaAbierto(null)} titulo={new Date(`${diaAbierto}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}>
          <ListaEventos eventos={porDia[diaAbierto] || []} todos={todos} onElegir={(e) => { setDiaAbierto(null); setSeleccionado(e); }} />
        </Modal>
      )}

      {seleccionado && (
        <Modal onCerrar={() => setSeleccionado(null)} titulo={seleccionado.posicion}>
          <DetalleEvento evento={seleccionado} hoy={hoy} onCambio={actualizarEvento} />
        </Modal>
      )}
    </div>
  );
}

function ListaEventos({ eventos, todos, onElegir }) {
  return (
    <ul className="mt-2 space-y-2">
      {eventos.map((e) => (
        <li key={e.idServicio}>
          <button onClick={() => onElegir(e)} className={`w-full text-left rounded-xl border px-3 py-2 hover:shadow-sm ${colorEvento(e)}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm no-underline">{e.posicion}</span>
              <EstadoConfirmacion estado={e.confirmacion} />
            </div>
            <p className="text-xs text-slate-600 mt-0.5 no-underline">
              {e.ministerio}{todos || !e.propio ? ` · ${e.persona}` : ''}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}

function DetalleEvento({ evento, hoy, onCambio }) {
  const futuro = evento.fecha >= hoy;
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-sm text-slate-700">
        <p><i className="fas fa-sitemap w-5 text-slate-400" aria-hidden="true"></i>{evento.ministerio}</p>
        <p><i className="fas fa-user w-5 text-slate-400" aria-hidden="true"></i>{evento.persona}</p>
        <p className="capitalize"><i className="fas fa-calendar w-5 text-slate-400" aria-hidden="true"></i>
          {new Date(`${evento.fecha}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div className="pt-1"><EstadoConfirmacion estado={evento.confirmacion} /></div>
        {evento.motivoConfirmacion && <p className="text-rose-700"><strong>Motivo:</strong> {evento.motivoConfirmacion}</p>}
      </div>

      {evento.propio && futuro && (
        <ConfirmarTurno idServicio={evento.idServicio} estado={evento.confirmacion} onCambio={onCambio} />
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        <a href={urlGoogle(evento)} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <i className="fab fa-google mr-2" aria-hidden="true"></i>Agregar a Google Calendar
        </a>
        <button onClick={() => descargarIcs([evento], `turno-${evento.fecha}.ics`)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <i className="fas fa-calendar-plus mr-2" aria-hidden="true"></i>Guardar en el celular
        </button>
      </div>
    </div>
  );
}

function PanelSuscripcion({ datos, onCerrar, onRegenerar }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(datos.url); setCopiado(true); } catch { setCopiado(false); }
  };
  return (
    <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-sm space-y-3">
      <div className="flex justify-between gap-2">
        <p className="font-bold text-indigo-900">Tus turnos en Google Calendar, siempre actualizados</p>
        <button onClick={onCerrar} aria-label="Cerrar" className="text-indigo-400 hover:text-indigo-700"><i className="fas fa-xmark" aria-hidden="true"></i></button>
      </div>
      <ol className="list-decimal ml-5 text-slate-700 space-y-1">
        <li>Toca <strong>“Abrir en Google Calendar”</strong> y acepta agregar el calendario.</li>
        <li>Si no funciona: en Google Calendar (computador) ve a <em>Otros calendarios → + → Desde URL</em> y pega el enlace.</li>
      </ol>
      <div className="flex flex-wrap gap-2">
        <a href={datos.google} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700">Abrir en Google Calendar</a>
        <a href={datos.webcal} className="px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-semibold">Calendario del iPhone</a>
        <button onClick={copiar} className="px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-semibold">
          {copiado ? '¡Enlace copiado!' : 'Copiar enlace'}
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Este enlace es personal: no lo compartas. Si crees que alguien lo tiene, {' '}
        <button onClick={onRegenerar} className="underline font-semibold text-indigo-700">genera uno nuevo</button>.
      </p>
    </div>
  );
}

function Segmento({ opciones, valor, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
      {opciones.map(([v, etiqueta]) => (
        <button key={String(v)} onClick={() => onChange(v)}
          className={`px-3 h-8 rounded-lg text-sm font-semibold ${valor === v ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
          {etiqueta}
        </button>
      ))}
    </div>
  );
}

function Leyenda() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
      <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-200" />Mi turno</span>
      <span className="inline-flex items-center gap-1"><i className="fas fa-circle-check text-emerald-600" aria-hidden="true"></i>Confirmado</span>
      <span className="inline-flex items-center gap-1"><i className="fas fa-circle-xmark text-rose-600" aria-hidden="true"></i>No puede</span>
      <span className="inline-flex items-center gap-1"><i className="fas fa-clock text-amber-600" aria-hidden="true"></i>Sin confirmar</span>
    </div>
  );
}

function Modal({ titulo, onCerrar, children }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onCerrar]);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onCerrar}>
      <div role="dialog" aria-modal="true" className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4 gap-2">
          <h3 className="text-lg font-bold text-slate-800 capitalize">{titulo}</h3>
          <button onClick={onCerrar} aria-label="Cerrar" className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500"><i className="fas fa-xmark" aria-hidden="true"></i></button>
        </div>
        {children}
      </div>
    </div>
  );
}
