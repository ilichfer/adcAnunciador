import { useState, useEffect, useMemo } from 'react';

// ─── Estados de carga y error ────────────────────────────────────────────────

function ScheduleLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-400 text-sm font-medium">Cargando programación...</p>
    </div>
  );
}

function ScheduleError({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-2">
        <i className="fas fa-exclamation-triangle"></i>
        <h3 className="font-bold">Error al cargar la programación</h3>
      </div>
      <p className="text-sm">{message || 'Verifica tu conexión e intenta de nuevo.'}</p>
    </div>
  );
}

function ScheduleEmpty() {
  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-calendar-times text-slate-300 text-4xl"></i>
      </div>
      <h3 className="text-xl font-bold text-slate-700 mb-2">Sin programación</h3>
      <p className="text-slate-500 max-w-xs mx-auto text-sm">
        No hay actividades programadas para los próximos días.
      </p>
    </div>
  );
}

// ─── Banner del coordinador ───────────────────────────────────────────────────

function CoordinatorBanner({ coordinator }) {
  if (!coordinator) return null;
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 shadow-lg shadow-emerald-100 flex items-center justify-between group hover:shadow-emerald-200 transition-all">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-emerald-900/30 text-emerald-950 rounded-2xl flex items-center justify-center font-black text-2xl border border-emerald-900/20 group-hover:scale-110 transition-transform">
          {coordinator.name ? coordinator.name.charAt(0) : '?'}
        </div>
        <div>
          <div className="text-emerald-900 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Coordinador General
          </div>
          <div className="text-emerald-950 font-black text-2xl leading-tight drop-shadow-sm">
            {coordinator.name || 'Sin nombre'}
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-3 bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-900/20">
        <i className="fas fa-user-shield text-emerald-900"></i>
        <span className="text-emerald-900 text-xs font-black uppercase tracking-widest">Coordinador</span>
      </div>
    </div>
  );
}

// ─── Tarjeta de ministerio ────────────────────────────────────────────────────

function MinistryCard({ ministryName, assignments }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-all hover:shadow-md">
      <div className="bg-indigo-600 px-5 py-3 flex justify-between items-center">
        <h4 className="text-white font-black text-xs uppercase tracking-widest">{ministryName}</h4>
        <i className="fas fa-users text-white/40 text-xs"></i>
      </div>
      <div className="p-5 space-y-5 flex-grow">
        {assignments.map((asgn, idx) => (
          <div
            key={asgn.positionId || idx}
            className="relative pl-4 border-l-2 border-slate-100 hover:border-indigo-400 transition-colors group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">
              {asgn.position}
            </span>
            <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {asgn.personName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

function ScheduleView({ events }) {
  const formatDate = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const uniqueDates = useMemo(
    () => Array.from(new Set(events.map((e) => e.date))).sort(),
    [events]
  );

  // ✅ selectedDate se inicializa con useEffect para reaccionar
  // cuando uniqueDates cambia tras el fetch
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (uniqueDates.length > 0) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates]);

  const filteredEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : events;

  return (
    <div className="space-y-6">
      {/* Encabezado + filtro de fechas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Programación</h2>
          <p className="text-sm text-slate-500">Vista consolidada de actividades próximas</p>
        </div>

        {uniqueDates.length > 1 && (
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl self-start overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedDate(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedDate === null
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-indigo-400'
              }`}
            >
              Ver Todos
            </button>
            {uniqueDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedDate === date
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-indigo-400'
                }`}
              >
                {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                })}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <ScheduleEmpty />
      ) : (
        <div className="space-y-12">
          {filteredEvents.map((event, eIdx) => (
            <div
              key={event.id || `${event.date}-${eIdx}`}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6"
            >
              {/* Separador de fecha */}
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-grow"></div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                  {formatDate(event.date)}{event.time ? ` — ${event.time}` : ''}
                </h3>
                <div className="h-px bg-slate-200 flex-grow"></div>
              </div>

              <CoordinatorBanner coordinator={event.coordinator} />

              {/* Tarjetas de ministerios */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(Array.isArray(event.ministries) ? event.ministries : []).map((minObj, mIdx) => {
                  const minName = Object.keys(minObj)[0];
                  return (
                    <MinistryCard
                      key={`${minName}-${mIdx}`}
                      ministryName={minName}
                      assignments={minObj[minName]}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Componente raíz con fetch ────────────────────────────────────────────────

function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch('https://anunciaig.com/api/events')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        // Soporta: objeto solo, array, o { events: [...] }
        let data = Array.isArray(json)
          ? json
          : json.events
            ? json.events
            : [json]; // ← objeto solo → lo envuelve en array

        // Filtrar solo los que tienen fecha válida
        data = data.filter(e => e && e.date);

        // Ordenar por fecha ascendente
        data.sort((a, b) => new Date(a.date) - new Date(b.date));

        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <ScheduleLoader />;
  if (error)   return <ScheduleError message={error} />;
  if (events.length === 0) return <ScheduleEmpty />;
  return <ScheduleView events={events} />;
}

export default Schedule;