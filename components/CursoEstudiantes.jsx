import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../components/useApi.js';

export default function CursoEstudiantes({ cursoId, estudiantes, onRefresh }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const [allPersonas, setAllPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await authFetch(getUrl('/users'));
        if (res.ok) setAllPersonas(await res.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const enrolledIds = useMemo(() => new Set(estudiantes.map(e => e.id)), [estudiantes]);

  const disponibles = useMemo(() => {
    const list = allPersonas.filter(p => !enrolledIds.has(p.id));
    if (!filter.trim()) return list;
    const term = filter.toLowerCase();
    return list.filter(p => (p.name || '').toLowerCase().includes(term) || (p.email || '').toLowerCase().includes(term));
  }, [allPersonas, enrolledIds, filter]);

  const toggleAll = () => {
    if (selected.size === disponibles.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(disponibles.map(p => p.id)));
    }
  };

  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleInscribirSeleccionados = async () => {
    if (selected.size === 0) { setError('Selecciona al menos un estudiante'); return; }
    setSaving(true);
    setError(null);
    setSuccess(null);
    let inscritos = 0;
    let fallidos = 0;
    for (const idPersona of selected) {
      try {
        const res = await authFetch(getUrl(`/cursos/${cursoId}/estudiantes`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idPersona })
        });
        if (res.ok) inscritos++; else fallidos++;
      } catch { fallidos++; }
    }
    setSelected(new Set());
    if (fallidos > 0) setError(`${inscritos} inscritos, ${fallidos} fallidos`);
    else setSuccess(`${inscritos} estudiante(s) inscrito(s) correctamente`);
    onRefresh();
    setSaving(false);
  };

  const handleDesinscribir = async (idPersona) => {
    if (!confirm('¿Remover estudiante del curso?')) return;
    try {
      const res = await authFetch(getUrl(`/cursos/${cursoId}/estudiantes/${idPersona}`), { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      {/* Inscribir multiples estudiantes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700">Inscribir Estudiantes ({disponibles.length} disponibles)</h4>
          <button
            onClick={handleInscribirSeleccionados}
            disabled={saving || selected.size === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <i className="fas fa-user-plus text-xs"></i>
            {saving ? 'Inscribiendo...' : `Inscribir ${selected.size > 0 ? `(${selected.size})` : ''}`}
          </button>
        </div>

        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        {success && <p className="text-emerald-600 text-xs mb-2">{success}</p>}

        <input
          type="text"
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm mb-3"
          placeholder="Buscar por nombre o email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-6 justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div> Cargando personas...
          </div>
        ) : disponibles.length === 0 ? (
          <div className="p-6 text-center">
            <i className="fas fa-user-check text-slate-200 text-3xl mb-2"></i>
            <p className="text-slate-400 text-sm">Todas las personas ya estan inscritas</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg mb-1">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-indigo-600"
                checked={selected.size === disponibles.length && disponibles.length > 0}
                onChange={toggleAll}
              />
              <span className="text-xs font-bold text-slate-500">
                {selected.size === disponibles.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {disponibles.map(p => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selected.has(p.id) ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600"
                    checked={selected.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                  />
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {p.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{p.email || 'Sin email'}</p>
                  </div>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lista de estudiantes inscritos */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h4 className="text-sm font-bold text-slate-700">Estudiantes Inscritos ({estudiantes.length})</h4>
        </div>
        {estudiantes.length === 0 ? (
          <div className="p-10 text-center">
            <i className="fas fa-user-graduate text-slate-200 text-4xl mb-3"></i>
            <p className="text-slate-400 text-sm">No hay estudiantes inscritos en este curso</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {estudiantes.map(est => (
              <div key={est.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {est.nombre?.[0]}{est.apellido?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{est.nombre} {est.apellido}</p>
                    <p className="text-[10px] text-slate-400">
                      {est.tipodocumento || 'CC'}: {est.documento} · {est.email || 'Sin email'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDesinscribir(est.id)}
                  className="p-2 rounded-lg hover:bg-rose-100 text-slate-300 hover:text-rose-600 transition-colors"
                  title="Desinscribir"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
