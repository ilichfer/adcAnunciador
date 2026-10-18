

// ─── Loader ───────────────────────────────────────────────────────────────────

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-400 text-sm font-medium">Cargando ministerios...</p>
    </div>
  );
}

export const SelectedUsersMinistry = ({ user }) => (
  <option value={user.id}>{user.nombre + ' ' + user.apellido}</option>
);

// ─── Tarjeta de ministerio ────────────────────────────────────────────────────

export function MinistryCard({ ministry, onRemove, onManage }) {
  const positions = (ministry.positions ?? []).filter(p => p.name?.trim());
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <i className="fas fa-sitemap"></i>
          </div>
          <h4 className="font-bold text-lg text-slate-800 capitalize">{ministry.name}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black uppercase">
            {positions.length} puestos
          </span>
          <button onClick={() => onRemove(ministry.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
            <i className="fas fa-trash-alt"></i>
          </button>
          <button onClick={() => onManage(ministry.id)} className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-lg font-bold uppercase hover:bg-indigo-700 transition-colors">
            Gestionar
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {positions.map(pos => (
          <span key={pos.id} className="text-[10px] bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100 font-bold uppercase">
            {pos.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Vista Detalle de Ministerio ──────────────────────────────────────────────
