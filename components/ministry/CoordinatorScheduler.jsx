import { useState } from 'react';

export function CoordinatorScheduler({ users, onSave, onCancel }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedUser || !date) {
      alert('Por favor selecciona una fecha y un coordinador.');
      return;
    }
    setSaving(true);
    try {
      const response = await onSave(date, selectedUser.id);
      if (response.ok) {
        alert('Coordinador programado con éxito.');
        onCancel();
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'ya existe un cordinador para la fecha seleccionada');
      }
    } catch (err) {
      alert('No se pudo guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getUserName = (u) => u.nombre ? `${u.nombre} ${u.apellido || ''}`.trim() : u.name || 'Usuario';

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Programar Coordinador General</h3>
          <p className="text-slate-500 text-sm">Asigna un responsable para la coordinación del servicio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Lado Izquierdo: Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coordinador Seleccionado</label>
            <input 
              type="text" 
              readOnly 
              value={selectedUser ? getUserName(selectedUser) : ''}
              placeholder="Selecciona de la lista..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold focus:outline-none cursor-default"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha del Servicio</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={saving || !selectedUser || !date}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
              Guardar Coordinador
            </button>
          </div>
        </div>

        {/* Lado Derecho: Listado de Personas */}
        <div className="lg:col-span-3 space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Listado de Personas</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${selectedUser?.id === u.id ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm'}`}
              >
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                  {getUserName(u).charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 text-sm truncate">{getUserName(u)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{u.rol || u.role || 'Servidor'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Panel de habilidades ─────────────────────────────────────────────────────
