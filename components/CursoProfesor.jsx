import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../components/useApi.js';

export default function CursoProfesor({ cursoId, profesor, onRefresh }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(profesor?.id || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      setLoading(true);
      try {
        const res = await authFetch(getUrl('/users'));
        if (res.ok) {
          const data = await res.json();
          setPersonas(data);
        }
      } catch (err) {
        console.error('Error cargando personas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonas();
  }, []);

  useEffect(() => {
    setSelectedId(profesor?.id || '');
  }, [profesor]);

  const handleAsignar = async () => {
    if (!selectedId) { setError('Selecciona una persona'); return; }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authFetch(getUrl(`/cursos/${cursoId}/profesor`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPersona: parseInt(selectedId) })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Error al asignar profesor');
      }
      setSuccess('Profesor asignado correctamente');
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Profesor actual */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h4 className="text-sm font-bold text-slate-700 mb-3">Profesor Asignado</h4>
        {profesor ? (
          <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              {profesor.nombre?.[0]}{profesor.apellido?.[0]}
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Profesor del Curso</p>
              <p className="text-lg font-bold text-slate-800">{profesor.nombre} {profesor.apellido}</p>
              <p className="text-xs text-slate-500">
                {profesor.tipodocumento || 'CC'}: {profesor.documento} · {profesor.email || 'Sin email'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <i className="fas fa-chalkboard-teacher text-slate-300 text-3xl mb-2"></i>
            <p className="text-slate-400 text-sm">No hay profesor asignado a este curso</p>
          </div>
        )}
      </div>

      {/* Asignar nuevo profesor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h4 className="text-sm font-bold text-slate-700 mb-3">{profesor ? 'Cambiar Profesor' : 'Asignar Profesor'}</h4>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div> Cargando personas...
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              className="flex-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Seleccionar persona...</option>
              {personas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email || 'sin email'})
                </option>
              ))}
            </select>
            <button
              onClick={handleAsignar}
              disabled={saving || !selectedId}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              <i className="fas fa-check text-xs"></i> {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        {success && <p className="text-emerald-600 text-xs mt-2">{success}</p>}
      </div>
    </div>
  );
}
