import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAppStore } from '../store/UseAppStore.jsx';
import { useApi } from '../components/useApi.js';
import RegisterPersonaModal from './RegisterPersonaModal.jsx';

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

function UserRow({ user, onToggleStatus, onRoleChange }) {
  const initials = (user.name ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const idRolActual = user.role === 'ADMINISTRADOR' ? 1 : user.role === 'USUARIO' ? 3 : 2;

  return (
    <tr className={`${user.active ? 'hover:bg-slate-50/50' : 'bg-slate-50 opacity-60'} transition-colors`}>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
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
        <select
          value={idRolActual}
          onChange={e => onRoleChange(user.id, parseInt(e.target.value))}
          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 mt-1 outline-none cursor-pointer"
        >
          <option value={2}>Servidor</option>
          <option value={1}>Administrador</option>
          <option value={3}>Usuario</option>
        </select>
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

// ─── Componente principal ─────────────────────────────────────────────────────

const UsersManager = () => {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();

  // ── Store: leer y escribir ──────────────────────────────────────────────────
  const users            = useAppStore(s => s.users);
  const setUsers         = useAppStore(s => s.setUsers);
  const toggleUserStatus = useAppStore(s => s.toggleUserStatus);

  // ── Estado local: solo UI ───────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch inicial: solo si el store está vacío para no repetir la llamada
  useEffect(() => {
    if (users.length > 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    authFetch(getUrl('/users'))
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        const lista = Array.isArray(data) ? data : data.users ?? [];
        // Carga masiva en el store preservando los IDs reales de la API
        setUsers(lista);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleToggle = async (id) => {
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return;

    const newActiveState = !targetUser.active;

    try {
      // Endpoint: /personas/{id}/toggle-active?active=true/false
      const res = await authFetch(getUrl(`/personas/${id}/toggle-active?active=${newActiveState}`));

      if (res.ok) {
        // Si el servidor confirma el cambio, actualizamos el store local
        toggleUserStatus(id);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error: ${errorData.message || 'No se pudo cambiar el estado del usuario.'}`);
      }
    } catch (err) {
      console.error('Error al cambiar el estado:', err);
      alert('Error de conexión con el servidor.');
    }
  };

  const handleRolChange = async (idPersona, newIdRol) => {
    const targetUser = users.find(u => u.id === idPersona);
    if (!targetUser) return;

    const nuevoRolLabel = newIdRol === 1 ? 'Administrador' : newIdRol === 3 ? 'Usuario' : 'Servidor';
    if (!window.confirm(`¿Estás seguro de cambiar el rol de "${targetUser.name}" a ${nuevoRolLabel}?`)) return;

    try {
      const res = await authFetch(getUrl(`/personas/${idPersona}/rol?idRol=${newIdRol}`), { method: 'PUT' });
      if (res.ok) {
        // Refrescar lista completa desde el servidor
        const refreshRes = await authFetch(getUrl('/users'));
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setUsers(Array.isArray(data) ? data : data.users ?? []);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error: ${errorData.message || 'No se pudo cambiar el rol.'}`);
      }
    } catch (err) {
      console.error('Error al cambiar rol:', err);
      alert('Error de conexión con el servidor.');
    }
  };

  const refreshUsers = async () => {
    try {
      const res = await authFetch(getUrl('/users'));
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users ?? []);
      }
    } catch (e) {
      console.error('Error al refrescar usuarios', e);
    }
  };

  const handleRegisterSuccess = () => {
    setShowForm(false);
    refreshUsers();
  };

  const handleCloseModal = () => setShowForm(false);

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
        <RegisterPersonaModal
          onClose={handleCloseModal}
          onSuccess={handleRegisterSuccess}
          defaultRol={2}
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
                  <UserRow key={user.id} user={user} onToggleStatus={handleToggle} onRoleChange={handleRolChange} />
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
