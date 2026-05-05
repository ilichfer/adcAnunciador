import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAppStore } from '../store/UseAppStore.jsx';
import { useApi } from './useApi.js';


// ─── Loader ───────────────────────────────────────────────────────────────────

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-400 text-sm font-medium">Cargando ministerios...</p>
    </div>
  );
}

const SelectedUsersMinistry = ({ user }) => (
  <option value={user.id}>{user.nombre + ' ' + user.apellido}</option>
);

// ─── Tarjeta de ministerio ────────────────────────────────────────────────────

function MinistryCard({ ministry, onRemove, onManage }) {
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

function MinistryDetailsView({ ministry, onBack, onAddAssignment, onRemoveMember, onAddPosition }) {
  const [usersByMinistry, setUsersByMinistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getUrl } = useApi();


  useEffect(() => {
    if (!ministry?.id) return;
    setLoading(true);
    fetch(getUrl(`ministries/${ministry.id}/personas`))
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

function AddPositionForm({ ministry, onCancel, onSave }) {
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

function AssignForm({ ministries, users, onCancel, onAddMinistries, onAddPerson }) {
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

function SchedulePlanner({ ministries, users, onSave, onCancel, authFetch }) {
  
  const { getUrl } = useApi();
  const [form, setForm]       = useState({ date: '', time: '09:00 AM', ministryId: '', assignments: {} });
  const [usersMin, setUsersMin] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeMinistry = ministries.find(m => m.id === form.ministryId);
  const assignedCount  = Object.values(form.assignments).filter(Boolean).length;

  useEffect(() => {
    if (!activeMinistry?.id) return;
    setLoading(true);
    fetch(getUrl(`ministries/${activeMinistry.id}/personas`))
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

function CoordinatorScheduler({ users, onSave, onCancel }) {
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

function SkillsPanel({ assignments, onAddClick, onRemove }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest px-2">Habilidades de Servidores</h3>
      {assignments.length === 0 ? (
        <div className="bg-slate-100/50 p-12 rounded-3xl border border-dashed border-slate-300 text-center text-slate-400">
          <i className="fas fa-user-tag text-3xl mb-3 opacity-20 block"></i>
          <p className="text-sm font-medium">No hay especialidades registradas.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {assignments.map(a => (
            <div key={a.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                  {a.userName?.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">{a.userName}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{a.ministryName}</div>
                </div>
              </div>
              <button onClick={() => onRemove(a.id)} className="ml-auto mr-4 text-slate-300 hover:text-red-500 transition-colors">
                <i className="fas fa-times-circle"></i>
              </button>
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-indigo-100">
                {a.positionName ?? a.position}
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={onAddClick}
        className="w-full py-4 mt-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:bg-white hover:border-indigo-300 hover:text-indigo-500 transition-all">
        <i className="fas fa-plus-circle mr-2"></i>Registrar Habilidad
      </button>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const MinistryManager = () => {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();

  // ── Store ──────────────────────────────────────────────────────────────────
  const storeMinistries    = useAppStore(s => s.ministries);
  const storeUsers         = useAppStore(s => s.users);
  const assignments        = useAppStore(s => s.assignments);
  const addEvent           = useAppStore(s => s.addEvent);
  const addAssignment      = useAppStore(s => s.addAssignment);
  const removeAssignment   = useAppStore(s => s.removeAssignment);
  const removeMinistry     = useAppStore(s => s.removeMinistry);
  const setActiveTab       = useAppStore(s => s.setActiveTab);

  // ── Estado local: solo UI ──────────────────────────────────────────────────
  const [view, setView]               = useState('list');
  const [ministries, setMinistries]   = useState([]);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedMinId, setSelectedMinId] = useState(null);
  const [addMinistries, setAddMinistries] = useState(null);

  const handleAddAssignment = (ministry) => {
    setAddMinistries(ministry);
    setView('assign');
  };

  const handleOpenAddPosition = (ministry) => {
    setAddMinistries(ministry);
    setView('add-position');
  };

  const handleSavePosition = async (idMinisterio, nombrePosicion) => {
    try {
      const res = await authFetch(getUrl(`/ministries/addposition`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idMinisterio, nombrePosicion }),
      });
      if (!res.ok) throw new Error();
      alert('Posición agregada con éxito.');
      setView('details');
    } catch (err) {
      alert('Error: No se pudo agregar la posición.');
    }
  };

  const handleAddPerson = async (idMinisterio, uId) => {
    try {
      const res = await authFetch(getUrl(`/ministeries/addperson`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPersona: uId, idMinisterio }),
      });
      if (!res.ok) alert('Error: No se pudo agregar la persona al ministerio.');
    } catch (err) {
      alert('Error de conexión al intentar agregar.');
    }
  };

  const handleDeleteAssignment = async (mId, sId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar a esta persona del ministerio?')) return;
    try {
      const res = await authFetch(getUrl(`/ministeries/${mId}/personas/${sId}`), { method: 'DELETE' });
      if (res.ok) {
        removeAssignment(mId); // actualiza el store
      } else {
        alert('Error: No se pudo eliminar la asignación en el servidor.');
      }
    } catch (err) {
      alert('Error de conexión al intentar eliminar.');
    }
  };

  // Fetch: usa datos del store si ya existen; si no, hace la petición.
  // Dependencias vacías [] → se ejecuta solo una vez al montar.
  // Los datos del store se leen en el momento de ejecutarse, sin crear un ciclo.
  useEffect(() => {
    if (storeMinistries.length > 0 && storeUsers.length > 0) {
      setMinistries(storeMinistries);
      setUsers(storeUsers);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      authFetch(getUrl(`/ministries`)).then(r => r.json()),
      authFetch(getUrl(`/users`)).then(r => r.json()),
    ])
      .then(([ministriesData, usersData]) => {
        setMinistries(Array.isArray(ministriesData) ? ministriesData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navBtn = (targetView, label, icon, color = 'indigo') => (
    <button
      onClick={() => setView(targetView)}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
        view === targetView
          ? color === 'emerald'
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      <i className={`fas ${icon}`}></i>{label}
    </button>
  );

  const handleManageMinistry = (id) => {
    setSelectedMinId(id);
    setView('details');
  };

  const handleSaveCoordinator = async (fecha, idPersona) => {

const requestCordinador = {
  fechaString:fecha,
  idPersona: idPersona
};

    return authFetch(getUrl(`/savecordinador`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestCordinador),
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Panel de Ministerios</h2>
        <div className="flex flex-wrap gap-2">
          {navBtn('create-schedule', 'Nueva Programación', 'fa-calendar-plus', 'emerald')}
          {navBtn('list',            'Ver Estructura',     'fa-th-list')}
          {navBtn('schedule-coordinator', 'Programar Coordinador', 'fa-user-tie')}
        </div>
      </div>

      {view === 'create-schedule' && (
        <SchedulePlanner
          ministries={ministries} users={users}
          authFetch={authFetch}
          onSave={(
            
            ev) => {
            addEvent(ev);       // guarda en el store
            setActiveTab('schedule'); // navega al tab de schedule
            setView('list');
          }}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'schedule-coordinator' && (
        <CoordinatorScheduler 
          users={users} 
          onCancel={() => setView('list')}
          onSave={handleSaveCoordinator}
        />
      )}

      {view === 'details' && selectedMinId && (
        <MinistryDetailsView
          ministry={ministries.find(m => m.id === selectedMinId)}
          onBack={() => setView('list')}
          onRemoveMember={handleDeleteAssignment}
          onAddAssignment={handleAddAssignment}
          onAddPosition={handleOpenAddPosition}
        />
      )}

      {view === 'add-position' && addMinistries && (
        <AddPositionForm
          ministry={addMinistries}
          onCancel={() => setView('details')}
          onSave={handleSavePosition}
        />
      )}

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest px-2">
              Estructuras Activas
              <span className="ml-2 normal-case font-medium text-slate-300">({ministries.length})</span>
            </h3>
            {ministries.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-14 text-center">
                <i className="fas fa-sitemap text-slate-300 text-3xl mb-3 block"></i>
                <p className="text-slate-400 text-sm">No hay ministerios disponibles.</p>
              </div>
            ) : (
              ministries.map(m => (
                <MinistryCard key={m.id} ministry={m}
                  onRemove={removeMinistry}
                  onManage={handleManageMinistry}
                />
              ))
            )}
          </div>
        </div>
      )}

      {view === 'assign' && addMinistries && (
        <AssignForm
          ministries={ministries} users={users}
          onCancel={() => setView('list')}
          onAddMinistries={addMinistries}
          onAddPerson={async (idMinisterio, uId) => {
            await handleAddPerson(idMinisterio, uId);
            setView('details');
          }}
        />
      )}
    </div>
  );
};

export default MinistryManager;