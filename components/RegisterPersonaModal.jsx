import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from './useApi.js';

const INITIAL_FORM = {
  nombre: '', apellido: '', documento: '', tipodocumento: 'CC',
  fechanacimiento: '', genero: '', estadoCivil: '',
  email: '', telefono: '', celular: '', direccion: '', ciudadDeptoDireccion: '',
  paisNacimiento: '', ciudad: '', ocupacion: '', escolaridad: '',
  fechaConvercionCristo: '', fechaLlegadaAdc: '', fechaBautizo: '', fechaBautizoEspiritu: '',
  discapacidad: false, descDiscapacidad: '', perteneceMinoria: false, descMinoria: '',
  password: '', confirmPassword: ''
};

// publicMode: registro público desde la landing (?registro=1), sin token y con UI standalone.
// defaultRol: rol que se envía al backend (si no se envía, el backend asigna USUARIO).
function RegisterPersonaModal({ onClose, onSuccess, publicMode = false, defaultRol }) {
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
      if (defaultRol) body.rol = defaultRol;
      delete body.confirmPassword;

      const res = publicMode
        ? await fetch(getUrl('/personas/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })
        : await authFetch(getUrl('/personas/register'), {
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
    <div className={publicMode ? '' : 'fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 bg-black/40 overflow-y-auto'}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden ${publicMode ? '' : 'mx-4'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{publicMode ? 'Crea tu cuenta' : 'Registrar Nueva Persona'}</h3>
          {!publicMode && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
          )}
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
            {!publicMode && (
              <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {saving ? 'Registrando...' : publicMode ? 'Crear Cuenta' : 'Registrar Persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPersonaModal;
