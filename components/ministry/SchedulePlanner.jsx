import { useState, useEffect } from 'react';
import { useApi, apiFetch } from '../useApi.js';
import { Loader, SelectedUsersMinistry } from './MinistryCards.jsx';

export function SchedulePlanner({ ministries, onSave, onCancel, authFetch }) {
  
  const { getUrl } = useApi();
  const [form, setForm]       = useState({ date: '', time: '09:00 AM', ministryId: '', assignments: {} });
  const [usersMin, setUsersMin] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeMinistry = ministries.find(m => m.id === form.ministryId);
  const assignedCount  = Object.values(form.assignments).filter(Boolean).length;

  useEffect(() => {
    if (!activeMinistry?.id) return;
    setLoading(true);
    apiFetch(getUrl(`ministries/${activeMinistry.id}/personas`))
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(json => setUsersMin(json))
      .catch(() => setUsersMin([]))
      .finally(() => setLoading(false));
  }, [activeMinistry?.id]);

  const handleAssign = (posId, value) =>
    setForm(prev => ({ ...prev, assignments: { ...prev.assignments, [posId]: value } }));

  const handleSave = async () => {
    if (!form.date || !form.ministryId) return alert('Completa la fecha y el ministerio.');
    const ministry  = ministries.find(m => m.id === form.ministryId);
    const formatted = Object.entries(form.assignments)
      .filter(([, name]) => name)
      .map(([posId, personId]) => ({
        fechaServicio: form.date, idPersona: personId, idPosicion: posId, idMinisterio: ministry.id,
      }));

    if (!formatted.length) return alert('Asigna al menos una persona.');

    try {
      const res = await authFetch(getUrl(`/saveService`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatted),
      });

      if (res.ok) {
        const conflicts = await res.json().catch(() => []);
        if (Array.isArray(conflicts) && conflicts.length > 0) {
          const names = conflicts
            .map(item => `${item.nombre} ${item.apellido}`)
            .join(', ');
          
          alert(`Aviso: El servidor (o servidores): ${names} ya tiene más asignaciones para esta fecha.`);
        }

        onSave({
          id: Date.now().toString(),
          date: form.date,
          time: form.time,
          ministries: [{ [ministry.name]: formatted }],
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        alert('Error al publicar la programación: ' + (errData.message || 'Error en el servidor'));
      }
    } catch (err) {
      alert('Error de conexión: ' + err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in zoom-in duration-300">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800">Planificador de Actividades</h3>
        <p className="text-slate-500 text-sm">Configura los roles para el próximo servicio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</label>
          <input type="date"
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ministerio</label>
          <select
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            value={form.ministryId}
            onChange={e => setForm({ ...form, ministryId: e.target.value, assignments: {} })}
          >
            <option value="">-- Elige un ministerio --</option>
            {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {activeMinistry && usersMin && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <i className="fas fa-users-cog"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 capitalize">{activeMinistry.name}</h4>
                <p className="text-xs text-slate-400">Selecciona quién ocupará cada puesto.</p>
              </div>
            </div>
            {assignedCount > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
                {assignedCount} asignado{assignedCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMinistry.positions.filter(p => p.name?.trim()).map(pos => {
              const assigned = form.assignments[pos.id];
              return (
                <div key={pos.id} className={`p-4 rounded-2xl border shadow-sm transition-all ${
                  assigned ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:shadow-md'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{pos.name}</span>
                    {assigned
                      ? <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                      : <i className="fas fa-chevron-right text-slate-300 text-[10px]"></i>
                    }
                  </div>
                  <select
                    className={`w-full p-2.5 rounded-lg text-sm font-medium outline-none border-none focus:ring-2 focus:ring-emerald-500 ${
                      assigned ? 'bg-white text-emerald-700 font-bold' : 'bg-slate-50'
                    }`}
                    value={form.assignments[pos.id] ?? ''}
                    onChange={e => handleAssign(pos.id, e.target.value)}
                  >
                    <option value="">-- Sin asignar --</option>
                    {usersMin.map(u => <SelectedUsersMinistry key={u.id} user={u} />)}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-end gap-4">
        <button onClick={onCancel} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
          Descartar
        </button>
        <button onClick={handleSave}
          className="px-10 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all">
          <i className="fas fa-paper-plane mr-2"></i>Publicar Programación
        </button>
      </div>
    </div>
  );
}

// ─── Vista Programar Coordinador ──────────────────────────────────────────────
