import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = 'https://anunciaig.com/api/users';

// ─── Loader ───────────────────────────────────────────────────────────────────

function UsersLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-400 text-sm font-medium">Cargando usuarios...</p>
    </div>
  );
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────

function EmptyUsers() {
  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-users text-slate-300 text-4xl"></i>
      </div>
      <h3 className="text-xl font-bold text-slate-700 mb-2">Sin usuarios registrados</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">
        Agrega el primer servidor usando el botón de arriba.
      </p>
    </div>
  );
}

// ─── Fila de usuario ──────────────────────────────────────────────────────────

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

// ─── Formulario nuevo usuario ─────────────────────────────────────────────────

const ROLES = ['ADMINISTRADOR', 'Líder de Ministerio', 'Servidor', 'Miembro'];
const EMPTY_USER = { name: '', role: 'Servidor', ministry: '', email: '' };

function AddUserForm({ onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_USER);
  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm(EMPTY_USER);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {[
          { label: 'Nombre Completo', key: 'name',     type: 'text',  placeholder: 'Ej: Andrés Soto' },
          { label: 'Ministerio',      key: 'ministry', type: 'text',  placeholder: 'Ej: Alabanza' },
          { label: 'Correo',          key: 'email',    type: 'email', placeholder: 'correo@ejemplo.com' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">{label}</label>
            <input
              type={type} placeholder={placeholder} required
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form[key]} onChange={set(key)}
            />
          </div>
        ))}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Rol</label>
          <select
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            value={form.role} onChange={set('role')}
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
          Registrar Usuario
        </button>
      </div>
    </form>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const UsersManager = ({ onAddUser, onToggleStatus }) => {
  const { authFetch } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch directo al endpoint
  useEffect(() => {
    setLoading(true);
    authFetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        const lista = Array.isArray(data) ? data : data.users ?? [];
        setUsers(lista);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleToggle = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
    if (onToggleStatus) onToggleStatus(id);
  };

  const handleAdd = (newUser) => {
    setUsers(prev => [...prev, { ...newUser, id: Date.now(), active: true }]);
    setShowForm(false);
    if (onAddUser) onAddUser(newUser);
  };

  const activeCount   = users.filter(u => u.active).length;
  const inactiveCount = users.length - activeCount;

  if (loading) return <UsersLoader />;

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-1">
        <i className="fas fa-exclamation-triangle"></i>
        <h3 className="font-bold">Error al cargar usuarios</h3>
      </div>
      <p className="text-sm">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
          {users.length > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {activeCount} activos · {inactiveCount} inactivos
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
          {showForm ? 'Cancelar' : 'Agregar Usuario'}
        </button>
      </div>

      {showForm && (
        <AddUserForm
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {users.length === 0 ? (
        <EmptyUsers />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {['Usuario', 'Ministerio / Rol', 'Estado', 'Acción'].map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase ${i === 2 ? 'text-center' : i === 3 ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(user => (
                  <UserRow key={user.id} user={user} onToggleStatus={handleToggle} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;