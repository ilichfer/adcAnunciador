import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_MINISTRIES = 'https://anunciaig.com/api/ministries';
const API_USERS      = 'https://anunciaig.com/api/users';
//const path      = 'http://localhost:5000/api';
const path      = 'https://anunciaig.com/api';


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
  // Filtrar posiciones sin nombre
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

function MinistryDetailsView({ ministry, assignments, users, onAssign, onRemoveMember, onBack , onAddAssignment}) {
 
  const [usersByMInistry, setUsersByMInistry]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
const activeMinistry = (ministry !== null) ? ministry : null;

  useEffect(() => {
    //fetch(`https://anunciaig.com/api/ministries/${ministry?.id}/personas`)
    fetch(`${path}/ministries/${ministry?.id}/personas`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al cargar el ministerio: ${response.statusText}`);
        }

        return response.json()
      })
      .then(json => {
        setUsersByMInistry(json)
      })
      .catch(err => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [activeMinistry])


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
          <button 
            onClick={() => onAddAssignment(ministry)}

            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-user-plus"></i> Agregar Persona
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest px-2">Servidores Asignados</h4>
          {usersByMInistry.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i className="fas fa-users-slash text-slate-200 text-2xl"></i>
              </div>
              <p className="text-slate-400 font-medium">No hay servidores asignados a este ministerio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersByMInistry.map(a => (
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
                    onClick={() => onRemoveMember(ministry.id,a.id)}
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



function UserRow({ user, onToggleStatus }) {
  const initials = (user.name ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <tr className={`${user.active ? 'hover:bg-slate-50/50' : 'bg-slate-50 opacity-60'} transition-colors`}>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          {/* Avatar con iniciales si no hay imagen */}
          {user.avatar ? (
            <img
              src={user.avatar}
              className="w-10 h-10 rounded-full border border-slate-200 object-cover"
              alt={user.name}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-200">
              {initials}
            </div>
          )}
          <div>
            <div className="font-bold text-slate-800">{user.name}</div>
            <div className="text-xs text-slate-400">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-slate-700">{user.ministry ?? '—'}</div>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 mt-1 inline-block">
          {user.role ?? 'Servidor'}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
          user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {user.active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => onToggleStatus(user.id)}
          className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
            user.active
              ? 'text-rose-600 hover:bg-rose-50'
              : 'text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          {user.active ? 'Desactivar' : 'Reactivar'}
        </button>
      </td>
    </tr>
  );
}


// ─── Formulario vincular servidor ────────────────────────────────────────────

function AssignForm({ ministries, users, onSave, onCancel,onAddMinistries,onAddPerson }) {
  const [form, setForm] = useState({ userId: '', ministryId: '', positionId: '' });
  const activeMinistry  = ministries.find(m => m.id === form.ministryId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user     = users.find(u => u.id === form.userId);
    const ministry = ministries.find(m => m.id === form.ministryId);
    const position = ministry?.positions.find(p => p.id === form.positionId);
    onSave({
      userId: form.userId, ministryId: form.ministryId, positionId: form.positionId,
      userName: user?.name, ministryName: ministry?.name, positionName: position?.name,
      id: Date.now().toString(),
    });
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
            <div>
              <h2>{onAddMinistries.name}</h2>
            </div>
          </div>
        </div>

        {activeMinistry && (
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
          <button type="button" onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancelar</button>
          <button type="submit" disabled={!form.userId} onClick={() => onAddPerson(onAddMinistries.id,form.userId)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Agregar Servidor
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Planificador de programación ─────────────────────────────────────────────

function SchedulePlanner({ ministries, users, onSave, onCancel }) {
  const [form, setForm] = useState({ date: '', time: '09:00 AM', ministryId: '', assignments: {} });
  const activeMinistry  = ministries.find(m => m.id === form.ministryId);
  const assignedCount   = Object.values(form.assignments).filter(Boolean).length;
  const [usersMin, setUsersMin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
   // fetch(`https://jscamp-api.vercel.app/api/jobs/${activeMinistry?.id}`)
    fetch(`https://anunciaig.com/api/ministries/${activeMinistry?.id}/personas`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al cargar el ministerio: ${response.statusText}`);
        }

        return response.json()
      })
      .then(json => {
        setUsersMin(json)
      })
      .catch(err => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [activeMinistry])

  

  const handleAssign = (posId, value) =>
    setForm(prev => ({ ...prev, assignments: { ...prev.assignments, [posId]: value } }));

  const handleSave = () => {
    if (!form.date || !form.ministryId) return alert('Completa la fecha y el ministerio.');
    console.log('Guardando programación con datos:', ministries, users, form);
    const ministry = ministries.find(m => m.id === form.ministryId);
    const date = form.date;
    const formatted = Object.entries(form.assignments)
      .filter(([, name]) => name)
      .map(([posId, personId]) => {
        console.log('Posición asignada:', { fechaServicio :date , idPersona: personId, idPosicion: posId, idMinisterio: ministry.id });
        return { fechaServicio :date , idPersona: personId, idPosicion: posId, idMinisterio: ministry.id };
      });
    if (!formatted.length) return alert('Asigna al menos una persona.');
    onSave({
      id: Date.now().toString(),
      date: form.date,
      time: form.time,
      ministries: [{ [ministry.name]: formatted }],
    });
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

                    {usersMin.map(u => (
                      <SelectedUsersMinistry key={u.id} user={u} /> 
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

const MinistryManager = ({ assignments = [], onAssignPerson, onAddEvent, onRemoveAssignment, onRemoveMinistry }) => {
  const { authFetch } = useAuth();
  const [view, setView]           = useState('list'); // 'list' | 'create-schedule' | 'assign' | 'details'
  const [ministries, setMinistries] = useState([]);
  const [addMinistries, setAadMinistries] = useState([]);
  const [users, setUsers]           = useState([]);
  const [usersByMInistry, setUsersByMInistry]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedMinId, setSelectedMinId] = useState(null);

  const handleAddAssignment = (ministry) => {
    setAadMinistries(ministry);
    setView('assign');
    console.log('Asignando persona al ministerio:', ministry.id);
  }

  const handleAddPerson = async (idMinisterio, uId) => {
    
    console.log('Agregando persona al ministerio:', { idPersona: uId, idMinisterio: idMinisterio });
    try {
      const res = await authFetch(`${path}/ministeries/addperson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idPersona: uId, idMinisterio: idMinisterio })
      });

      if (res.ok) {
        // Handle successful addition
      } else {
        alert('Error: No se pudo agregar la persona al ministerio.');
      }
    } catch (err) {
      console.error("Error adding person:", err);
      alert('Error de conexión al intentar agregar.');
    }
  };


  // Función para eliminar la asignación en el servidor y luego actualizar el estado local
  const handleDeleteAssignment = async (mId,sId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar a esta persona del ministerio?')) return;

    try {
      //const res = await authFetch(`https://anunciaig.com/api/ministeries/${mId}/personas/${sId}`, {
      const res = await authFetch(`${path}/ministeries/${mId}/personas/${sId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (onRemoveAssignment) onRemoveAssignment(mId);
      } else {
        alert('Error: No se pudo eliminar la asignación en el servidor.');
      }
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert('Error de conexión al intentar eliminar.');
    }
  };



  // Fetch ministerios y usuarios en paralelo
  useEffect(() => {
    setLoading(true);
    Promise.all([
      authFetch(API_MINISTRIES).then(r => r.json()),
      authFetch(API_USERS).then(r => r.json()),
    ])
      .then(([ministriesData, usersData]) => {
        setMinistries(Array.isArray(ministriesData) ? ministriesData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);



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

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Panel de Ministerios</h2>
        <div className="flex flex-wrap gap-2">
          {navBtn('create-schedule', 'Nueva Programación', 'fa-calendar-plus', 'emerald')}
          {navBtn('list',            'Ver Estructura',     'fa-th-list')}
        </div>
      </div>

      {view === 'create-schedule' && (
        <SchedulePlanner
          ministries={ministries} users={users}
          onSave={(ev) => { if (onAddEvent) onAddEvent(ev); setView('list'); }}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'details' && selectedMinId && (
        <MinistryDetailsView 
          ministry={ministries.find(m => m.id === selectedMinId)}
          assignments={assignments}
          users={usersByMInistry}
          onBack={() => setView('list')}
          onAssign={() => setView('assign')}
          onRemoveMember={handleDeleteAssignment}
          onAddAssignment={handleAddAssignment}
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
                  onRemove={onRemoveMinistry} 
                  onManage={handleManageMinistry} />
              ))
            )}
          </div>
        
        </div>
      )}

      {view === 'assign' && (
        <AssignForm
          ministries={ministries} users={users}
          onSave={(a) => { if (onAssignPerson) onAssignPerson(a); setView('list'); }}
          onCancel={() => setView('list')}
          onAddMinistries={addMinistries}
          onAddPerson={handleAddPerson}
        />
      )}
    </div>
  );
};

export default MinistryManager;