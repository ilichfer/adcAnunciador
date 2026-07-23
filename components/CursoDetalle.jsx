import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../components/useApi.js';
import CursoEstudiantes from './CursoEstudiantes.jsx';
import CursoProfesor from './CursoProfesor.jsx';
import CursoNotas from './CursoNotas.jsx';

export default function CursoDetalle({ curso, onBack }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const [tab, setTab] = useState('info');
  const [cursoData, setCursoData] = useState(curso);
  const [profesor, setProfesor] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);

  const fetchCurso = async () => {
    try {
      const res = await authFetch(getUrl(`/cursos/${curso.id}`));
      if (res.ok) setCursoData(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchProfesor = async () => {
    try {
      const res = await authFetch(getUrl(`/cursos/${curso.id}/profesor`));
      if (res.ok) setProfesor(await res.json());
      else setProfesor(null);
    } catch (err) { setProfesor(null); }
  };

  const fetchEstudiantes = async () => {
    try {
      const res = await authFetch(getUrl(`/cursos/${curso.id}/estudiantes`));
      if (res.ok) setEstudiantes(await res.json());
      else setEstudiantes([]);
    } catch (err) { setEstudiantes([]); }
  };

  useEffect(() => { fetchCurso(); fetchProfesor(); fetchEstudiantes(); }, []);

  const tabs = [
    { id: 'info', label: 'Información', icon: 'fa-info-circle' },
    { id: 'estudiantes', label: `Estudiantes (${estudiantes.length})`, icon: 'fa-users' },
    { id: 'notas', label: 'Notas', icon: 'fa-clipboard-list' },
    { id: 'profesor', label: 'Profesor', icon: 'fa-chalkboard-teacher' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button + Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{cursoData.nombreCurso}</h2>
          <p className="text-slate-400 text-sm">{cursoData.fechaInicio || 'Sin fecha'}{cursoData.fechaFin ? ` → ${cursoData.fechaFin}` : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fas ${t.icon} text-xs`}></i> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'info' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</p>
                <p className="text-slate-800 font-bold">{cursoData.nombreCurso}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Inicio</p>
                <p className="text-slate-800 font-bold">{cursoData.fechaInicio || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Fin</p>
                <p className="text-slate-800 font-bold">{cursoData.fechaFin || '—'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total</p>
                <p className="text-slate-800 font-bold">${(cursoData.valorTotal || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cursoData.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  {cursoData.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comentarios</p>
                <p className="text-slate-800 font-bold">{cursoData.comentario ? 'Habilitados' : 'Deshabilitados'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'estudiantes' && (
        <CursoEstudiantes cursoId={curso.id} estudiantes={estudiantes} onRefresh={fetchEstudiantes} />
      )}

      {tab === 'profesor' && (
        <CursoProfesor cursoId={curso.id} profesor={profesor} onRefresh={fetchProfesor} />
      )}

      {tab === 'notas' && (
        <CursoNotas cursoId={curso.id} />
      )}
    </div>
  );
}
