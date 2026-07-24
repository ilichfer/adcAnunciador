import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../components/useApi.js';
import CursoDetalle from './CursoDetalle.jsx';

const EMPTY_CURSO = {
  nombreCurso: '', fechaInicio: '', fechaFin: '', valorTotal: 0, check: true, profesor: 0
};

function HistoricoNotasModal({ onClose }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const [personas, setPersonas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionada, setSeleccionada] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [cargando, setCargando] = useState(true);

  const colorBg = (nf) => nf >= 4.7 ? 'bg-emerald-50' : nf < 3 ? 'bg-rose-50' : 'bg-amber-50';
  const colorTxt = (nf) => nf >= 4.7 ? 'text-emerald-700' : nf < 3 ? 'text-rose-700' : 'text-amber-700';

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(getUrl('/personas/todas'));
        if (res.ok) {
          const data = await res.json();
          setPersonas(Array.isArray(data) ? data : []);
        }
      } catch (err) { console.error(err); }
      finally { setCargando(false); }
    })();
  }, []);

  const filtradas = busqueda.trim().length >= 1
    ? personas.filter(p => {
        const texto = `${p.nombre || ''} ${p.apellido || ''} ${p.documento || ''}`.toLowerCase();
        return texto.includes(busqueda.toLowerCase());
      })
    : personas;

  const seleccionarPersona = async (p) => {
    setSeleccionada(p);
    setHistoricoLoading(true);
    try {
      const res = await authFetch(getUrl(`/personas/${p.id}/notas-historico`));
      if (res.ok) {
        const d = await res.json();
        setHistorico(Array.isArray(d) ? d : []);
      } else setHistorico([]);
    } catch { setHistorico([]); }
    finally { setHistoricoLoading(false); }
  };

  const agrupado = {};
  historico.forEach(n => {
    const fechaStr = n.curso?.fechaInicio || '';
    let year = new Date().getFullYear();
    let semestre = 1;
    if (fechaStr) {
      const parts = fechaStr.split(/[-/]/);
      if (parts.length >= 1) year = parseInt(parts[0]) || year;
      if (parts.length >= 2) { const m = parseInt(parts[1]) || 1; semestre = m <= 6 ? 1 : 2; }
    }
    if (!agrupado[year]) agrupado[year] = { s1: [], s2: [] };
    if (semestre === 1) agrupado[year].s1.push(n);
    else agrupado[year].s2.push(n);
  });
  const years = Object.keys(agrupado).sort((a, b) => b - a);

  const SemestreTabla = ({ notas, label }) => {
    if (notas.length === 0) return null;
    return (
      <div className="mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</p>
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-2.5 text-left">Curso</th>
                <th className="px-3 py-2.5 text-center">Maestro (30%)</th>
                <th className="px-3 py-2.5 text-center">Asistencia (20%)</th>
                <th className="px-3 py-2.5 text-center">Practica (20%)</th>
                <th className="px-3 py-2.5 text-center">Examen (30%)</th>
                <th className="px-3 py-2.5 text-center">Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notas.map((n, idx) => {
                const nf = n.notaFinal ?? 0;
                return (
                  <tr key={idx} className={`${colorBg(nf)} transition-colors`}>
                    <td className="px-4 py-2.5 font-bold text-slate-800">{n.curso?.nombreCurso ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-700">{n.notaMaestro ?? 0}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-700">{n.notaAsistencia ?? 0}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-700">{n.notaPractica ?? 0}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-700">{n.notaExamenFinal ?? 0}</td>
                    <td className={`px-3 py-2.5 text-center font-black ${colorTxt(nf)}`}>{nf.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800"><i className="fas fa-clipboard-list text-indigo-500 mr-2"></i>Histórico de Notas por Persona</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {!seleccionada ? (
            <>
              <div className="relative mb-4">
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
                  <i className="fas fa-search text-slate-400 text-sm"></i>
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
                    placeholder="Buscar por nombre, apellido o documento..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    autoFocus
                  />
                  {busqueda && (
                    <button onClick={() => setBusqueda('')} className="text-slate-400 hover:text-slate-600">
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
              </div>

              {cargando ? (
                <div className="flex items-center justify-center py-16 gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <p className="text-slate-400 text-sm">Cargando personas...</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {filtradas.length} persona{filtradas.length !== 1 ? 's' : ''} {busqueda ? 'encontrada' + (filtradas.length !== 1 ? 's' : '') : 'en total'}
                  </p>
                  <div className="space-y-1 max-h-[55vh] overflow-y-auto rounded-xl border border-slate-100">
                    {filtradas.length === 0 ? (
                      <div className="p-10 text-center">
                        <i className="fas fa-users text-slate-200 text-4xl mb-3 block"></i>
                        <p className="text-slate-400 text-sm">No se encontraron personas</p>
                      </div>
                    ) : (
                      filtradas.map(p => (
                        <button
                          key={p.id}
                          onClick={() => seleccionarPersona(p)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-0 group"
                        >
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-indigo-500 flex items-center justify-center flex-shrink-0 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-indigo-400 transition-colors"></div>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {p.nombre?.[0]}{p.apellido?.[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 text-sm truncate">{p.nombre} {p.apellido}</p>
                            <p className="text-[10px] text-slate-400">{p.tipodocumento || 'CC'}: {p.documento}{p.email ? ` · ${p.email}` : ''}</p>
                          </div>
                          <i className="fas fa-chevron-right text-slate-300 group-hover:text-indigo-500 text-xs flex-shrink-0 transition-colors"></i>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {seleccionada.nombre?.[0]}{seleccionada.apellido?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800">{seleccionada.nombre} {seleccionada.apellido}</p>
                  <p className="text-xs text-slate-400">{seleccionada.tipodocumento || 'CC'}: {seleccionada.documento}{seleccionada.email ? ` · ${seleccionada.email}` : ''}</p>
                </div>
                <button
                  onClick={() => { setSeleccionada(null); setHistorico([]); }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold flex-shrink-0 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-white transition-colors"
                >
                  <i className="fas fa-arrow-left mr-1"></i> Cambiar
                </button>
              </div>

              {historicoLoading ? (
                <div className="flex items-center justify-center py-10 gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <p className="text-slate-400 text-sm">Cargando historial...</p>
                </div>
              ) : historico.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <i className="fas fa-clipboard-list text-slate-300 text-4xl mb-3 block"></i>
                  <p className="text-slate-400 text-sm">Esta persona no tiene notas registradas</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {years.map(year => (
                    <div key={year}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-black text-sm">{year}</span>
                        </div>
                        <h4 className="text-xl font-black text-slate-800">{year}</h4>
                      </div>
                      <div className="ml-[52px] space-y-4">
                        <SemestreTabla notas={agrupado[year].s1} label="Primer Semestre (Ene - Jun)" />
                        <SemestreTabla notas={agrupado[year].s2} label="Segundo Semestre (Jul - Dic)" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [showHistorico, setShowHistorico] = useState(false);

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingCurso(null); setShowForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
          >
            <i className="fas fa-plus text-xs"></i> Nuevo Curso
          </button>
          <button
            onClick={() => setShowHistorico(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 transition-colors"
          >
            <i className="fas fa-clipboard-list text-xs text-indigo-500"></i> Histórico por Persona
          </button>
        </div>
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
      {showHistorico && <HistoricoNotasModal onClose={() => setShowHistorico(false)} />}
    </div>
  );
}
