import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAppStore } from '../store/UseAppStore.jsx';
import { useApi } from '../components/useApi.js';

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

  const idRolActual = user.role === 'ADMINISTRADOR' ? 1 : 2;

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

// ─── Modal Registrar Persona ───────────────────────────────────────────────────

const INITIAL_FORM = {
  nombre: '', apellido: '', documento: '', tipodocumento: 'CC',
  fechanacimiento: '', genero: '', estadoCivil: '',
  email: '', telefono: '', celular: '', direccion: '', ciudadDeptoDireccion: '',
  paisNacimiento: '', ciudad: '', ocupacion: '', escolaridad: '',
  fechaConvercionCristo: '', fechaLlegadaAdc: '', fechaBautizo: '', fechaBautizoEspiritu: '',
  discapacidad: false, descDiscapacidad: '', perteneceMinoria: false, descMinoria: '',
  password: '', confirmPassword: ''
};

function RegisterPersonaModal({ onClose, onSuccess }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre || !form.apellido || !form.documento) {
      setError('Nombre, apellido y documento son obligatorios');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);
    try {
      const body = { ...form, documento: parseInt(form.documento) };
      delete body.confirmPassword;

      const res = await authFetch(getUrl('/personas/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Error al registrar');
      }

      setForm(INITIAL_FORM);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm";
  const labelClass = "text-xs font-bold text-slate-500 uppercase ml-1";
  const sectionTitle = "text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-200";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Registrar Nueva Persona</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          {/* 1. Información Personal */}
          <div>
            <h4 className={sectionTitle}>Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Tipo Documento</label>
                <select className={inputClass} value={form.tipodocumento} onChange={set('tipodocumento')}>
                  <option value="CC">Cédula Ciudadanía</option>
                  <option value="CE">Cédula Extranjería</option>
                  <option value="TI">Tarjeta Identidad</option>
                  <option value="PA">Pasaporte</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>N° Documento *</label>
                <input type="number" className={inputClass} value={form.documento} onChange={set('documento')} required placeholder="123456789" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Nombres *</label>
                <input type="text" className={inputClass} value={form.nombre} onChange={set('nombre')} required placeholder="Nombre" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Apellidos *</label>
                <input type="text" className={inputClass} value={form.apellido} onChange={set('apellido')} required placeholder="Apellido" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Fecha Nacimiento</label>
                <input type="date" className={inputClass} value={form.fechanacimiento} onChange={set('fechanacimiento')} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Género</label>
                <select className={inputClass} value={form.genero} onChange={set('genero')}>
                  <option value="">Seleccionar</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Estado Civil</label>
                <select className={inputClass} value={form.estadoCivil} onChange={set('estadoCivil')}>
                  <option value="">Seleccionar</option>
                  <option value="SOLTERO">Soltero</option>
                  <option value="CASADO">Casado</option>
                  <option value="DIVORCIADO">Divorciado</option>
                  <option value="VIUDO">Viudo</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Contacto */}
          <div>
            <h4 className={sectionTitle}>Contacto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Email</label>
                <input type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="correo@ejemplo.com" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Teléfono</label>
                <input type="text" className={inputClass} value={form.telefono} onChange={set('telefono')} placeholder="Teléfono fijo" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Celular</label>
                <input type="text" className={inputClass} value={form.celular} onChange={set('celular')} placeholder="Celular" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Dirección</label>
                <input type="text" className={inputClass} value={form.direccion} onChange={set('direccion')} placeholder="Dirección residencia" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Ciudad / Departamento</label>
                <input type="text" className={inputClass} value={form.ciudadDeptoDireccion} onChange={set('ciudadDeptoDireccion')} placeholder="Ej: Bogotá / Cundinamarca" />
              </div>
            </div>
          </div>

          {/* 3. Información Adicional */}
          <div>
            <h4 className={sectionTitle}>Información Adicional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>País Nacimiento</label>
                <input type="text" className={inputClass} value={form.paisNacimiento} onChange={set('paisNacimiento')} placeholder="Colombia" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Ciudad</label>
                <input type="text" className={inputClass} value={form.ciudad} onChange={set('ciudad')} placeholder="Ciudad de nacimiento" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Ocupación</label>
                <input type="text" className={inputClass} value={form.ocupacion} onChange={set('ocupacion')} placeholder="Ocupación" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Escolaridad</label>
                <select className={inputClass} value={form.escolaridad} onChange={set('escolaridad')}>
                  <option value="">Seleccionar</option>
                  <option value="PRIMARIA">Primaria</option>
                  <option value="SECUNDARIA">Secundaria</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="UNIVERSITARIO">Universitario</option>
                  <option value="POSTGRADO">Postgrado</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Iglesia */}
          <div>
            <h4 className={sectionTitle}>Iglesia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Fecha Conversión a Cristo</label>
                <input type="text" className={inputClass} value={form.fechaConvercionCristo} onChange={set('fechaConvercionCristo')} placeholder="Fecha de conversión a Cristo" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Fecha Llegada ADC</label>
                <input type="text" className={inputClass} value={form.fechaLlegadaAdc} onChange={set('fechaLlegadaAdc')} placeholder="Fecha de llegada a ADC" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Fecha Bautizo</label>
                <input type="text" className={inputClass} value={form.fechaBautizo} onChange={set('fechaBautizo')} placeholder="Fecha de bautizo" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Fecha Bautizo Espíritu Santo</label>
                <input type="text" className={inputClass} value={form.fechaBautizoEspiritu} onChange={set('fechaBautizoEspiritu')} placeholder="Fecha de bautizo del Espíritu Santo" />
              </div>
            </div>
          </div>

          {/* 5. Opciones */}
          <div>
            <h4 className={sectionTitle}>Opciones</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="chkDisc" checked={form.discapacidad} onChange={set('discapacidad')} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="chkDisc" className="text-sm font-medium text-slate-700">Discapacidad</label>
              </div>
              {form.discapacidad && (
                <input type="text" className={inputClass + " ml-6"} value={form.descDiscapacidad} onChange={set('descDiscapacidad')} placeholder="Describa la discapacidad" />
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="chkMin" checked={form.perteneceMinoria} onChange={set('perteneceMinoria')} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="chkMin" className="text-sm font-medium text-slate-700">Pertenece a minoría</label>
              </div>
              {form.perteneceMinoria && (
                <input type="text" className={inputClass + " ml-6"} value={form.descMinoria} onChange={set('descMinoria')} placeholder="Describa la minoría" />
              )}
            </div>
          </div>

          {/* 6. Cuenta */}
          <div>
            <h4 className={sectionTitle}>Cuenta</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className={inputClass + " pr-10"} value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Confirmar Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className={inputClass + " pr-10"} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repita la contraseña" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-200">
            <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {saving ? 'Registrando...' : 'Registrar Persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
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

    const nuevoRolLabel = newIdRol === 1 ? 'Administrador' : 'Servidor';
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