import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../components/useApi.js';
import CursoDetalle from './CursoDetalle.jsx';

const EMPTY_CURSO = {
  nombreCurso: '', fechaInicio: '', fechaFin: '', valorTotal: 0, check: true, profesor: 0
};

function CursoFormModal({ curso, onClose, onSave }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const [form, setForm] = useState(curso || EMPTY_CURSO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (curso) {
      setForm({
        ...curso,
        profesor: typeof curso.profesor === 'object' && curso.profesor !== null
          ? curso.profesor.id
          : (curso.profesor || 0),
      });
    } else {
      setForm({ ...EMPTY_CURSO });
    }
  }, [curso]);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked
      : e.target.type === 'number' ? parseInt(e.target.value) || 0
      : e.target.value;
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.nombreCurso) { setError('El nombre del curso es obligatorio'); return; }
    if (!form.fechaInicio) { setError('La fecha de inicio es obligatoria'); return; }
    setSaving(true);
    try {
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `/cursos/${form.id}` : '/cursos';
      const body = {
        id: form.id || 0,
        nombreCurso: form.nombreCurso,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin || '',
        valorTotal: form.valorTotal || 0,
        check: form.check || false,
        profesor: typeof form.profesor === 'object' && form.profesor !== null
          ? form.profesor.id : (parseInt(form.profesor) || 0),
      };
      const res = await authFetch(getUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Error al guardar curso');
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm";
  const labelClass = "text-xs font-bold text-slate-500 uppercase ml-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{form.id ? 'Editar Curso' : 'Nuevo Curso'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div className="space-y-1">
            <label className={labelClass}>Nombre del Curso *</label>
            <input className={inputClass} value={form.nombreCurso} onChange={set('nombreCurso')} placeholder="Ej: Escuela Bíblica" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Fecha Inicio *</label>
              <input type="date" className={inputClass} value={form.fechaInicio} onChange={set('fechaInicio')} required />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Fecha Fin</label>
              <input type="date" className={inputClass} value={form.fechaFin} onChange={set('fechaFin')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CursosManager() {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState(null);

  const fetchCursos = async () => {
    setLoading(true);
    try {
      const res = await authFetch(getUrl('/cursos'));
      if (res.ok) {
        const data = await res.json();
        setCursos(data);
      }
    } catch (err) {
      console.error('Error cargando cursos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCursos(); }, []);

  const handleDesactivar = async (id) => {
    if (!confirm('¿Desactivar este curso?')) return;
    try {
      const res = await authFetch(getUrl(`/cursos/${id}/desactivar`), { method: 'PUT' });
      if (res.ok) fetchCursos();
    } catch (err) {
      console.error('Error desactivando curso:', err);
    }
  };

  if (selectedCurso) {
    return <CursoDetalle curso={selectedCurso} onBack={() => setSelectedCurso(null)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cursos</h2>
          <p className="text-slate-400 text-sm mt-1">Gestiona los cursos, estudiantes y profesores</p>
        </div>
        <button
          onClick={() => { setEditingCurso(null); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-plus text-xs"></i> Nuevo Curso
        </button>
      </div>

      {/* Lista de cursos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-400 text-sm">Cargando cursos...</p>
        </div>
      ) : cursos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-graduation-cap text-slate-300 text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Sin cursos creados</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">Crea el primer curso usando el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cursos.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedCurso(c)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-indigo-600 text-sm"></i>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingCurso(c); setShowForm(true); }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Editar"
                  >
                    <i className="fas fa-pen text-xs"></i>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDesactivar(c.id); }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Desactivar"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{c.nombreCurso}</h4>
              <div className="text-xs text-slate-400 space-y-1">
                <p><i className="fas fa-calendar mr-1"></i>{c.fechaInicio || 'Sin fecha'}{c.fechaFin ? ` → ${c.fechaFin}` : ''}</p>
                {c.profesor && <p><i className="fas fa-chalkboard-teacher mr-1"></i>{c.profesor.nombre} {c.profesor.apellido}</p>}
                {c.valorTotal > 0 && <p><i className="fas fa-dollar-sign mr-1"></i>${c.valorTotal.toLocaleString()}</p>}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  {c.activo ? 'Activo' : 'Inactivo'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-indigo-500">
                  Ver detalle <i className="fas fa-arrow-right ml-1"></i>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CursoFormModal
          curso={editingCurso}
          onClose={() => { setShowForm(false); setEditingCurso(null); }}
          onSave={() => { setShowForm(false); setEditingCurso(null); fetchCursos(); }}
        />
      )}
    </div>
  );
}
