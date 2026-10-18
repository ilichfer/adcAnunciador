import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../useApi.js';

export function CoordinatorEditor({ currentCoordinator, date, onBack, onSaved }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(currentCoordinator?.id || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authFetch(getUrl('/users'))
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.users || [];
        setUsers(list);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!selectedUserId) return alert("Por favor selecciona un coordinador.");
    setSaving(true);
    try {
      const res = await authFetch(getUrl('/savecordinador'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaString: date, idPersona: selectedUserId }),
      });
      if (!res.ok) throw new Error();
      onSaved();
    } catch (err) {
      alert('No se pudo actualizar el coordinador. Verifica si ya existe uno asignado.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-slate-400 text-sm">Cargando servidores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0">
          <i className="fas fa-chevron-left"></i>
        </button>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reasignar responsable</p>
          <h3 className="text-xl font-black text-slate-800">Coordinador General</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha del Servicio</label>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold capitalize">
            {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nuevo Coordinador</label>
          <select
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold appearance-none transition-all"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">-- Selecciona un servidor --</option>
            {users.filter(u => u.active).map(u => (
              <option key={u.id} value={u.id}>{u.name || `${u.nombre || ''} ${u.apellido || ''}`.trim() || 'Usuario'}</option>
            ))}
          </select>
          <i className="fas fa-chevron-down absolute right-4 bottom-5 text-slate-400 pointer-events-none"></i>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onBack} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || !selectedUserId}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vista principal del servicio ─────────────────────────────────────────────
