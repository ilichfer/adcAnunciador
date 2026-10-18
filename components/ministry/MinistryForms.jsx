import { useState } from 'react';

export function AddPositionForm({ ministry, onCancel, onSave }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(ministry.id, name.trim());
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in zoom-in duration-300">
      <h3 className="text-xl font-bold mb-6 text-slate-800">Agregar Nueva Posición a {ministry.name}</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre de la Posición</label>
          <input required autoFocus
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Ej: Baterista, Sonidista, etc."
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">
            Cancelar
          </button>
          <button type="submit" disabled={!name.trim()}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-40">
            Agregar Posición
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Formulario vincular servidor ─────────────────────────────────────────────

export function AssignForm({ users, onCancel, onAddMinistries, onAddPerson }) {
  const [form, setForm] = useState({ userId: '', positionId: '' });
  const activeMinistry  = onAddMinistries;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddPerson(activeMinistry.id, form.userId);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in zoom-in duration-300">
      <h3 className="text-xl font-bold mb-6 text-slate-800">Vincular Servidor al Ministerio</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Servidor</label>
            <select required
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}
            >
              <option value="">-- Seleccionar --</option>
              {users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ministerio</label>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 capitalize">
              {activeMinistry?.name}
            </div>
          </div>
        </div>

        {activeMinistry?.positions && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Posición</label>
            <div className="flex flex-wrap gap-2">
              {activeMinistry.positions.filter(p => p.name?.trim()).map(pos => (
                <button key={pos.id} type="button"
                  onClick={() => setForm({ ...form, positionId: pos.id })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    form.positionId === pos.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-400'
                  }`}
                >{pos.name}</button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">
            Cancelar
          </button>
          <button type="submit" disabled={!form.userId}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Agregar Servidor
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Planificador de programación ─────────────────────────────────────────────
