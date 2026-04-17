import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAppStore } from '../store/UseAppStore.jsx';
import { useApi } from '../components/useApi.js';

// ─── Loader ───────────────────────────────────────────────────────────────────

function ProfileLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-400 text-sm font-medium">Cargando perfil...</p>
    </div>
  );
}

// ─── Tarjeta de turno ─────────────────────────────────────────────────────────

function ConsultDetailView({ data, onBack }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Programación General</p>
          <h3 className="text-xl font-black text-slate-800 capitalize">Detalle del Servicio</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                {[ 'Posición', 'Encargado', 'Fecha'].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">                  
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600">{item.posicion}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      <i className="fas fa-user-circle text-slate-300"></i>
                      <span className="text-sm font-semibold">{item.encargado}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400 tabular-nums">
                      {item.fechaServcio}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50">
            <i className="fas fa-search text-slate-200 text-4xl mb-4 block"></i>
            <p className="text-slate-400 font-medium">No se encontró información detallada.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TurnoCard({ turno, onConsultar }) {
  const fecha = new Date(turno.fechaServcio + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const esFuturo = fecha >= hoy;

  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const diaCorto = fecha.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric',
  });

  return (
    <div className={`p-4 rounded-2xl border transition-all hover:shadow-md ${esFuturo
        ? 'bg-white border-slate-200 hover:border-indigo-300'
        : 'bg-slate-50 border-slate-100 opacity-70'
      }`}>
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${esFuturo ? 'bg-indigo-50 text-indigo-900' : 'bg-slate-100 text-slate-700'
          }`}>
          {diaCorto}
        </span>
        {!esFuturo && <span className="text-[10px] text-slate-900 font-bold uppercase">Pasado</span>}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-purple-400 flex items-center justify-center">
          <i className="fas fa-sitemap text-purple-500 text-[10px]"></i>
        </div>
        <span className="text-s font-black text-purple-600 uppercase tracking-wider">
          {turno.nombreMinisterio}
        </span>
      </div>
      <div className="font-bold text-slate-800 text-xl mb-2">{turno.posicion}</div>
      <div className="flex items-center gap-1.5 text-slate-800">
        <i className="fas fa-user-shield text-[20px]"></i>
        <span className="text-[20px] font-bold">{turno.encargado}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100">
        <span className="text-[15px] text-slate-900 capitalize">{fechaFormateada}</span>
      </div>
      <button
        onClick={() => onConsultar(turno.fechaServcio, turno.idMinisterio)}
        className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-wider border border-indigo-100"
      >
        <i className="fas fa-search mr-2"></i>
        Consultar
      </button>
    </div>
  );
}

// ─── Sección de programación ──────────────────────────────────────────────────

function MiProgramacion({ schedule, loading, error, onConsultar }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

 

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-calendar-alt text-indigo-500"></i>
          Mi Programación
        </h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-slate-400 text-sm">Cargando turnos...</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-10 bg-red-50 rounded-xl border border-red-100">
          <i className="fas fa-exclamation-triangle text-red-300 text-2xl mb-2 block"></i>
          <p className="text-red-400 text-sm">No se pudo cargar la programación</p>
        </div>
      )}

      {!loading && !error && schedule.length === 0 && (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <i className="fas fa-calendar-times text-slate-300 text-3xl mb-3 block"></i>
          <p className="text-slate-400 text-sm">No tienes turnos próximos programados.</p>
        </div>
      )}

      {!loading && !error && schedule.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map((turno, idx) => (
            <TurnoCard key={`${turno.fechaServcio}-${turno.idMinisterio}-${idx}`} turno={turno} onConsultar={onConsultar} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vista del perfil ─────────────────────────────────────────────────────────

function ProfileView({ user, schedule, scheduleLoading, scheduleError, onConsultar }) {
  const ministerios = useMemo(() => {
    if (!user?.ministry) return [];
    if (Array.isArray(user.ministry)) return user.ministry;
    return [user.ministry];
  }, [user?.ministry]);

  const initials = useMemo(() => {
    return (user?.name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }, [user?.name]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-3xl">
                {initials}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
          {user.role && (
            <span className="inline-block mt-1 text-xs font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
              {user.role}
            </span>
          )}
          {ministerios.length > 0 && (

            <div className="flex flex-wrap gap-2 mt-3">
              
              <h3 className="text-lg font-semibold mb-4">
                ministerios:
              </h3>
              
              {ministerios.map((m, i) => (
                <span key={i} className="text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-100">
                  <i className="fas fa-sitemap mr-1 text-[10px]"></i>{m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">
          <i className="fas fa-id-card mr-2 text-indigo-500"></i>Contacto
        </h3>
        <div className="space-y-3">
          {user.email && (
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <i className="fas fa-envelope text-slate-400 text-sm"></i>
              </div>
              <span>{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <i className="fas fa-phone text-slate-400 text-sm"></i>
              </div>
              <span>{user.phone}</span>
            </div>
          )}
          {!user.email && !user.phone && (
            <p className="text-slate-400 text-sm">Sin información de contacto</p>
          )}
        </div>
      </div>

      {/* Programación */}
      <MiProgramacion schedule={schedule} loading={scheduleLoading} error={scheduleError} onConsultar={onConsultar} />
    </div>
  );
}


// ─── Componente raíz ──────────────────────────────────────────────────────────

const Profile = () => {
  const { authUser, authFetch } = useAuth();
  const { getUrl } = useApi();

  // ── Store: reutiliza el perfil ya cargado en fetchAppData ─────────────────
  const storeUser = useAppStore(s => s.user);

  // ── Estado local: carga del perfil y programación ─────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setSchLoading] = useState(true);
  const [scheduleError, setSchError] = useState(false);

  // Estados para la vista de detalle
  const [view, setView] = useState('profile'); // 'profile' | 'detail'
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Manejador para consultar el horario específico
  const handleConsultar = (fecha, idMinisterio) => {
    setDetailLoading(true);
    authFetch(getUrl(`/findSchedule?fecha=${fecha}&idMinisterio=${idMinisterio}`))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setDetailData(Array.isArray(data) ? data : [data]);
        setView('detail');
      })
      .catch(err => {
        console.error('Error al consultar la programación:', err);
        alert("No se pudo cargar el detalle del servicio.");
      })
      .finally(() => setDetailLoading(false));
  };

  // Si el store ya tiene el usuario, lo usa directamente
  useEffect(() => {
    if (storeUser) {
      setUser(storeUser);
      setLoading(false);
    } else if (!authUser) {
      setLoading(false);
    } else {
      // Fallback: carga individual si el store aún no tiene datos
      setLoading(true);
      authFetch(getUrl('/user'))
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => setUser({
          name: authUser?.nombre ?? 'Usuario',
          role: authUser?.rol ?? 'Servidor',
          email: '', phone: '', avatar: null, ministry: [],
        }))
        .finally(() => setLoading(false));
    }
  }, [storeUser, authUser]);

  // Programación personal (siempre se carga individualmente por persona)
  useEffect(() => {
    if (!authUser?.id) return;
    setSchLoading(true);
    fetch(getUrl(`/schedule/persona/${authUser.id}`))
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(json => { setSchedule(Array.isArray(json) ? json : []); setSchError(false); })
      .catch(() => setSchError(true))
      .finally(() => setSchLoading(false));
  }, [authUser?.id]);

  if (loading || detailLoading) return <ProfileLoader />;
  if (!user) return null;

  if (view === 'detail') {
    return <ConsultDetailView data={detailData} onBack={() => setView('profile')} />;
  }

  return (
    <ProfileView
      user={user}
      schedule={schedule}
      scheduleLoading={scheduleLoading}
      scheduleError={scheduleError}
      onConsultar={handleConsultar}
    />
  );
};

export default Profile;