import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi, apiFetch } from '../useApi.js';
import { color } from './colors.js';

export function MinistryEditor({ ministry, date, onBack, onSaved }) {
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
      apiFetch(getUrl(`/ministries/${ministry.id}/personas`))
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
