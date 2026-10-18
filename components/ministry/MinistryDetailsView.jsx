import { useState, useEffect } from 'react';
import { useApi, apiFetch } from '../useApi.js';
import { Loader } from './MinistryCards.jsx';

export function MinistryDetailsView({ ministry, onBack, onAddAssignment, onRemoveMember, onAddPosition }) {
  const [usersByMinistry, setUsersByMinistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getUrl } = useApi();


  useEffect(() => {
    if (!ministry?.id) return;
    setLoading(true);
    apiFetch(getUrl(`ministries/${ministry.id}/personas`))
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(json => setUsersByMinistry(json))
      .catch(() => setUsersByMinistry([]))
      .finally(() => setLoading(false));
  }, [ministry?.id]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
              <i className="fas fa-chevron-left"></i>
            </button>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 capitalize">{ministry.name}</h3>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">Gestión de Personal</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAddPosition(ministry)}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <i className="fas fa-plus-circle"></i> Agregar Posición
            </button>
            <button
              onClick={() => onAddAssignment(ministry)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <i className="fas fa-user-plus"></i> Agregar Persona
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest px-2">Servidores Asignados</h4>
          {usersByMinistry.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i className="fas fa-users-slash text-slate-200 text-2xl"></i>
              </div>
              <p className="text-slate-400 font-medium">No hay servidores asignados a este ministerio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersByMinistry.map(a => (
                <div key={a.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                      {a.nombre?.charAt(0) + ' ' + a.apellido?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{a.nombre + ' ' + a.apellido}</div>
                      <div className="text-xs font-bold text-indigo-500 uppercase tracking-tight">
                        {a.positionName || a.position}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveMember(ministry.id, a.id)}
                    className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Eliminar de ministerio"
                  >
                    <i className="fas fa-user-minus"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Formulario nueva posición ────────────────────────────────────────────────
