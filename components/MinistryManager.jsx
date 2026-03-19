import { useState } from 'react';

// ─── Estado vacío ministerios ─────────────────────────────────────────────────

function EmptyMinistries() {
  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-14 text-center col-span-full">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-sitemap text-slate-300 text-3xl"></i>
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-1">Sin ministerios</h3>
      <p className="text-slate-400 text-sm">Crea el primer ministerio con el botón de arriba.</p>
    </div>
  );
}

// ─── Tarjeta de ministerio ────────────────────────────────────────────────────

function MinistryCard({ ministry }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <i className="fas fa-sitemap"></i>
          </div>
          <h4 className="font-bold text-lg text-slate-800">{ministry.name}</h4>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black uppercase">
          {ministry.positions.length} puestos
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ministry.positions.map(pos => (
          <span key={pos.id} className="text-[10px] bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100 font-bold uppercase">
            {pos.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Formulario crear ministerio ──────────────────────────────────────────────

function CreateMinistryForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', positions: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const positions = form.positions
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => ({ id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, name: p }));
    onSave(form.name, positions);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-xl font-bold mb-6 text-slate-800">Nuevo Ministerio</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre del Ministerio</label>
          <input
            type="text" placeholder="Ej: Audiovisuales" required
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Posiciones (separadas por coma)</label>
          <textarea
            placeholder="Ej: Cámara 1, Consola, Pantallas" required
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none h-28 resize-none"
            value={form.positions} onChange={e => setForm({ ...form, positions: e.target.value })}
          />
          <p className="text-xs text-slate-400 italic">Define qué roles existen dentro de este ministerio.</p>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
          <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            Crear Ministerio
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Formulario vincular servidor ────────────────────────────────────────────

function AssignForm({ ministries, users, onSave, onCancel }) {
  const [form, setForm] = useState({ userId: '', ministryId: '', positionId: '' });
  const activeMinistry = ministries.find(m => m.id === form.ministryId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user     = users.find(u => u.id === form.userId);
    const ministry = ministries.find(m => m.id === form.ministryId);
    const position = ministry?.positions.find(p => p.id === form.positionId);
    onSave({ userId: form.userId, ministryId: form.ministryId, positionId: form.positionId,
              userName: user?.name, ministryName: ministry?.name, positionName: position?.name });
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in zoom-in duration-300">
      <h3 className="text-xl font-bold mb-6 text-slate-800">Vincular Servidor a Posición</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Servidor</label>
            <select
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" required
              value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}
            >
              <option value="">-- Seleccionar --</option>
              {users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ministerio</label>
            <select
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" required
              value={form.ministryId} onChange={e => setForm({ ...form, ministryId: e.target.value, positionId: '' })}
            >
              <option value="">-- Seleccionar --</option>
              {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {activeMinistry && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Posición</label>
            <div className="flex flex-wrap gap-2">
              {activeMinistry.positions.map(pos => (
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
          <button type="button" onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
          <button type="submit" disabled={!form.positionId}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Guardar Especialidad
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Planificador de programación ─────────────────────────────────────────────

function SchedulePlanner({ ministries, users, onSave, onCancel }) {
  const [form, setForm] = useState({ date: '', time: '09:00 AM', ministryId: '', assignments: {} });
  const activeMinistry = ministries.find(m => m.id === form.ministryId);
  const assignedCount  = Object.values(form.assignments).filter(Boolean).length;

  const handleAssign = (posId, value) =>
    setForm(prev => ({ ...prev, assignments: { ...prev.assignments, [posId]: value } }));

  const handleSave = () => {
    if (!form.date || !form.ministryId) return alert('Completa la fecha y selecciona un ministerio.');
    const ministry = ministries.find(m => m.id === form.ministryId);
    const members  = Object.entries(form.assignments)
      .filter(([, name]) => name)
      .map(([posId, personName]) => ({
        positionId: posId,
        position:   ministry.positions.find(p => p.id === posId)?.name ?? posId,
        personName,
        ministryName: ministry.name,
      }));
    if (members.length === 0) return alert('Asigna al menos una persona.');
    onSave({
      id:          Date.now().toString(),
      date:        form.date,
      time:        form.time,
      ministries:  [{ [ministry.name]: members }],
    });
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in zoom-in duration-300">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800">Planificador de Actividades</h3>
        <p className="text-slate-500 text-sm mt-1">Configura los roles para el próximo servicio.</p>
      </div>

      {/* Fecha y ministerio */}
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

      {/* Asignación de posiciones */}
      {activeMinistry && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <i className="fas fa-users-cog"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Asignación: {activeMinistry.name}</h4>
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
            {activeMinistry.positions.map(pos => {
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
                    {users.filter(u => u.active).map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
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

// ─── Panel de habilidades ─────────────────────────────────────────────────────

function SkillsPanel({ assignments, onAddClick }) {
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



const MinistryManager = ({ ministries, users, assignments, onAddMinistry, onAssignPerson, onAddEvent }) => {
  const [view, setView] = useState('list');

  const navBtn = (targetView, label, icon, color = 'indigo') =>
    <button
      onClick={() => setView(targetView)}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
        view === targetView
          ? `bg-${color}-600 text-white shadow-lg shadow-${color}-200`
          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      <i className={`fas ${icon}`}></i>{label}
    </button>;

  return (
    <div className="space-y-6">
      {/* Encabezado con navegación */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Panel de Ministerios</h2>
        <div className="flex flex-wrap gap-2">
          {navBtn('create-schedule', 'Nueva Programación', 'fa-calendar-plus', 'emerald')}
          {navBtn('add-ministry',    'Crear Ministerio',   'fa-plus')}
          {navBtn('list',            'Ver Estructura',     'fa-th-list')}
        </div>
      </div>

      {/* Vistas */}
      {view === 'create-schedule' && (
        <SchedulePlanner
          ministries={ministries} users={users}
          onSave={(ev) => { onAddEvent(ev); setView('list'); }}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'add-ministry' && (
        <CreateMinistryForm
          onSave={(name, positions) => { onAddMinistry(name, positions); setView('list'); }}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest px-2">Estructuras Activas</h3>
            {ministries.length === 0
              ? <EmptyMinistries />
              : ministries.map(m => <MinistryCard key={m.id} ministry={m} />)
            }
          </div>
          <SkillsPanel assignments={assignments} onAddClick={() => setView('assign')} />
        </div>
      )}

      {view === 'assign' && (
        <AssignForm
          ministries={ministries} users={users}
          onSave={(a) => { onAssignPerson(a); setView('list'); }}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  );
};

export default MinistryManager;