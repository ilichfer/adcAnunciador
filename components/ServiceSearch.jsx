import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../components/useApi.js';

// ─── Colores por ministerio (cíclico) ─────────────────────────────────────────
const COLORS = [
  { bg: 'bg-indigo-600',  light: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200'  },
  { bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-purple-600',  light: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
  { bg: 'bg-rose-600',    light: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200'    },
  { bg: 'bg-amber-600',   light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  { bg: 'bg-cyan-600',    light: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200'    },
];
const color = (i) => COLORS[i % COLORS.length];

// ─── Tarjeta de ministerio (con botón Editar) ─────────────────────────────────

function MinistryCard({ ministry, colorIndex, onEdit }) {
  const c           = color(colorIndex);
  const { id, name, positions = [] } = ministry;

  return (
    <div className={`rounded-2xl border ${c.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${c.bg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <i className="fas fa-sitemap text-white/70 text-xs"></i>
          <h4 className="text-white font-black text-xs uppercase tracking-widest capitalize">
            {name}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[10px] font-bold">
            {positions.length} {positions.length === 1 ? 'persona' : 'personas'}
          </span>
          {/* ← Pasa id, name, colorIndex y posiciones originales al editor */}
          <button
            onClick={() => onEdit({ id, name, colorIndex, originalPositions: positions })}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/35 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-colors"
          >
            <i className="fas fa-pen text-[9px]"></i>
            Editar
          </button>
        </div>
      </div>

      {/* Lista de posiciones */}
      <div className={`${c.light} divide-y divide-white/60`}>
        {positions.map((item) => (
          <div key={item.positionId} className="flex items-center gap-3 px-4 py-2.5">
            <div className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-bold text-[10px]">
                {item.personName?.trim().charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{item.personName?.trim()}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${c.text} capitalize`}>
                {item.position}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vista de edición de un ministerio ───────────────────────────────────────
// Recibe: { id, name, colorIndex } — hace fetch de posiciones y personas en paralelo

function MinistryEditor({ ministry, date, onBack, onSaved }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const c             = color(ministry.colorIndex);

  // ── Carga de datos ─────────────────────────────────────────────────────────
  const [positions,  setPositions]  = useState([]);  // posiciones del ministerio
  const [personas,   setPersonas]   = useState([]);  // personas vinculadas al ministerio
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState(null);
  const [initialDraft, setInitialDraft] = useState({}); // Para detectar cambios reales

  // ── Draft: mapa de positionId -> personId ──────────────────────────────────
  const [draft, setDraft] = useState(() => {
    const map = {};
    (ministry.originalPositions ?? []).forEach(p => {
      const posId = p.positionId ?? p.id;
      map[posId] = ''; // Se sincronizará en useEffect con IDs reales
    });
    return map;
  });

  // ── Estado del guardado ────────────────────────────────────────────────────
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ── Fetch en paralelo: posiciones del ministerio + personas vinculadas ─────
  useEffect(() => {
    if (!ministry.id) { setLoading(false); return; }

    setLoading(true);
    setLoadError(null);

    Promise.all([
      // 1. Posiciones del ministerio (estructura con las posiciones asignadas en el servicio)
      authFetch(getUrl(`/ministries/${ministry.id}`))
        .then(r => { if (!r.ok) throw new Error(`Error cargando ministerio: ${r.status}`); return r.json(); }),

      // 2. Personas vinculadas a este ministerio
      fetch(getUrl(`/ministries/${ministry.id}/personas`))
        .then(r => { if (!r.ok) throw new Error(`Error cargando personas: ${r.status}`); return r.json(); }),
    ])
      .then(([ministerioData, personasData]) => {
        const catalogPos = Array.isArray(ministerioData?.positions)
          ? ministerioData.positions
          : [];
        const personasList = Array.isArray(personasData) ? personasData : [];

        // Mapear nombres que ya estaban en el servicio a IDs de la lista de personas
        const mappedDraft = {};
        catalogPos.forEach(p => {
          const original = (ministry.originalPositions ?? []).find(op => op.positionId === p.id);
          if (original) {
            const match = personasList.find(pers => 
              `${pers.nombre ?? ''} ${pers.apellido ?? ''}`.trim() === original.personName?.trim()
            );
            mappedDraft[p.id] = match ? match.id : '';
          } else {
            mappedDraft[p.id] = '';
          }
        });

        setPositions(catalogPos);
        setPersonas(personasList);
        setDraft(mappedDraft);
        setInitialDraft(mappedDraft);
      })
      .catch(err => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [ministry.id]);

  const handleChange = (positionId, personName) => {
    setDraft(prev => ({ ...prev, [positionId]: personName }));
    setSuccess(false);
    setSaveError(null);
  };

  const getPersonNameById = (id) => {
    const p = personas.find(pers => String(pers.id) === String(id));
    return p ? `${p.nombre ?? ''} ${p.apellido ?? ''}`.trim() : '';
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setSaveError(null);

    const assignments = positions.map(p => {
      const posId = p.id ?? p.positionId;
      const selectedId = draft[posId];
      return {
        fecha:        date,
        idPosicion:   posId,
        personId:    selectedId || 0, // Se agrega el campo solicitado
        personName:   getPersonNameById(selectedId),
        ministryName: ministry.name,
      };
    });

    const payload = {
      date,
      ministryId: ministry.id,
      ministry:   ministry.name,
      assignments
    };

    try {
      const res = await authFetch(getUrl('/updateprog'), {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setSuccess(true);
      setTimeout(() => onSaved(), 1200);
    } catch (err) {
      setSaveError('No se pudo guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const haycambios = Object.keys(draft).some(posId => draft[posId] !== initialDraft[posId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-slate-400 text-sm">Cargando ministerio...</p>
      </div>
    );
  }

  // ── Error de carga ─────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-bold">
          <i className="fas fa-chevron-left"></i> Volver
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-center gap-3">
          <i className="fas fa-exclamation-triangle text-red-400 text-xl flex-shrink-0"></i>
          <p className="text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editando ministerio</p>
          <h3 className="text-xl font-black text-slate-800 capitalize">{ministry.name}</h3>
        </div>
      </div>

      {/* Tarjeta de edición */}
      <div className={`rounded-2xl border ${c.border} overflow-hidden shadow-sm`}>

        {/* Header del ministerio — solo lectura */}
        <div className={`${c.bg} px-5 py-4`}>
          <div className="flex items-center gap-2 mb-0.5">
            <i className="fas fa-sitemap text-white/70 text-sm"></i>
            <h4 className="text-white font-black text-sm uppercase tracking-widest capitalize">
              {ministry.name}
            </h4>
          </div>
          <p className="text-white/60 text-xs">
            {positions.length} posiciones · {personas.length} personas disponibles
          </p>
        </div>

        {/* Filas: posición (fija) + select de persona (editable) */}
        <div className="divide-y divide-slate-100 bg-white">
          {positions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No hay posiciones configuradas para este ministerio.
            </div>
          ) : (
            positions.map((pos) => {
              const posId   = pos.id ?? pos.positionId;
              const changed = draft[posId] !== initialDraft[posId];

              return (
                <div
                  key={posId}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${changed ? 'bg-amber-50/60' : ''}`}
                >
                  {/* Posición — solo lectura */}
                  <div className="w-36 flex-shrink-0">
                    <p className={`text-[11px] font-black uppercase tracking-wide ${c.text} capitalize`}>
                      {pos.name ?? pos.position}
                    </p>
                  </div>

                  {/* Select de persona */}
                  <div className="flex-1 relative">
                    <select
                      value={draft[posId] ?? ''}
                      onChange={e => handleChange(posId, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-colors ${
                        changed ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="">— Sin asignar —</option>
                      {personas.map(p => {
                        const nombre = `${p.nombre ?? ''} ${p.apellido ?? ''}`.trim();
                        return (
                          <option key={p.id} value={p.id}>{nombre}</option>
                        );
                      })}
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"></i>
                  </div>

                  {/* Dot de cambio pendiente */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-opacity ${changed ? 'bg-amber-400 opacity-100' : 'opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="text-sm min-h-[20px]">
            {success && (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
                <i className="fas fa-check-circle"></i> Programación actualizada
              </span>
            )}
            {saveError && (
              <span className="text-rose-600 font-bold flex items-center gap-1.5">
                <i className="fas fa-exclamation-circle"></i> {saveError}
              </span>
            )}
            {!success && !saveError && haycambios && (
              <span className="text-amber-600 text-xs font-medium">Hay cambios sin guardar</span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !haycambios}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-100 disabled:shadow-none transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed"
          >
            {saving
              ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
              : <><i className="fas fa-save"></i> Actualizar programación</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Editor de Coordinador ───────────────────────────────────────────────────

function CoordinatorEditor({ currentCoordinator, date, onBack, onSaved }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(currentCoordinator?.id || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authFetch(getUrl('/users'))
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.users || [];
        setUsers(list);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!selectedUserId) return alert("Por favor selecciona un coordinador.");
    setSaving(true);
    try {
      const res = await authFetch(getUrl('/savecordinador'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaString: date, idPersona: selectedUserId }),
      });
      if (!res.ok) throw new Error();
      onSaved();
    } catch (err) {
      alert('No se pudo actualizar el coordinador. Verifica si ya existe uno asignado.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-slate-400 text-sm">Cargando servidores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0">
          <i className="fas fa-chevron-left"></i>
        </button>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reasignar responsable</p>
          <h3 className="text-xl font-black text-slate-800">Coordinador General</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha del Servicio</label>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold capitalize">
            {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nuevo Coordinador</label>
          <select
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold appearance-none transition-all"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">-- Selecciona un servidor --</option>
            {users.filter(u => u.active).map(u => (
              <option key={u.id} value={u.id}>{u.name || `${u.nombre || ''} ${u.apellido || ''}`.trim() || 'Usuario'}</option>
            ))}
          </select>
          <i className="fas fa-chevron-down absolute right-4 bottom-5 text-slate-400 pointer-events-none"></i>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onBack} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || !selectedUserId}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vista principal del servicio ─────────────────────────────────────────────

function ServiceView({ data, date, onRefresh }) {
  const [editing, setEditing] = useState(null); // { id, name, colorIndex } | null
  const [editingCoord, setEditingCoord] = useState(false);

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Formato nuevo: [ { id, name, positions: [...] }, ... ]
  const ministerios = (data.ministries ?? []).map((m, i) => ({
    id:        m.id,
    name:      m.name,
    positions: Array.isArray(m.positions) ? m.positions : [],
    colorIndex: i,
  }));

  const totalPersonas = ministerios.reduce((sum, m) => sum + m.positions.length, 0);

  if (editing) {
    return (
      <MinistryEditor
        ministry={editing}
        date={date}
        onBack={() => setEditing(null)}
        onSaved={() => { setEditing(null); onRefresh(); }}
      />
    );
  }

  if (editingCoord) {
    return (
      <CoordinatorEditor
        currentCoordinator={data.coordinator}
        date={date}
        onBack={() => setEditingCoord(false)}
        onSaved={() => { setEditingCoord(false); onRefresh(); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      

      {/* Coordinador */}
      {data.coordinator && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-user-shield text-white text-sm"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Coordinador General</p>
              <p className="font-bold text-slate-800">{data.coordinator?.name ?? data.coordinator}</p>
            </div>
          </div>
          <button
            onClick={() => setEditingCoord(true)}
            className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors border border-emerald-200"
          >
            <i className="fas fa-user-edit mr-1"></i> Editar
          </button>
        </div>
      )}

      {/* Grilla de ministerios */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ministerios.map((m) => (
          <MinistryCard
            key={`${m.id}-${m.name}`}
            ministry={m}
            colorIndex={m.colorIndex}
            onEdit={setEditing}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────

function Empty({ date }) {
  return (
    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <i className="fas fa-calendar-times text-slate-300 text-4xl mb-4 block"></i>
      <p className="font-bold text-slate-500">Sin programación</p>
      <p className="text-slate-400 text-sm mt-1">No se encontró ningún servicio para el {date}.</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

function ServiceSearch() {
  const { authFetch }  = useAuth();
  const { getUrl } = useApi();
  const [selectedDate, setSelectedDate] = useState('');
  const [service,      setService]      = useState(null);
  const [notFound,     setNotFound]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const fetchService = (date) => {
    if (!date) return;
    setLoading(true);
    setService(null);
    setNotFound(false);
    setError(null);

    authFetch(getUrl(`/findprog?date=${date}`))
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!data) return;
        data.ministries?.length > 0 ? setService(data) : setNotFound(true);
      })
      .catch(err => setError('No se pudo cargar la programación: ' + err.message))
      .finally(() => setLoading(false));
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchService(date);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">

        {/* Encabezado + selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Consultar Servicios</h2>
            <p className="text-slate-500 text-sm mt-1">Selecciona una fecha para ver y editar la programación.</p>
          </div>
          <div className="space-y-1 w-full md:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Fecha del Servicio
            </label>
            <input
              type="date"
              className="w-full md:w-56 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
        </div>

        {!selectedDate && (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
            <i className="fas fa-search text-slate-200 text-4xl mb-4 block"></i>
            <p className="text-slate-400 font-medium">Selecciona una fecha para comenzar</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Cargando programación...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-red-400 text-xl flex-shrink-0"></i>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {notFound && !loading && !error && <Empty date={selectedDate} />}

        {service && !loading && !error && (
          <ServiceView
            data={service}
            date={selectedDate}
            onRefresh={() => fetchService(selectedDate)}
          />
        )}
      </div>
    </div>
  );
}

export default ServiceSearch;