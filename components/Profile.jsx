import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_USER     = '/api/user';
const API_SCHEDULE = 'https://anunciaig.com/api/schedule/persona'; // endpoint que devuelve la programación

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

function TurnoCard({ turno }) {
  const fecha = new Date(turno.fechaServcio + 'T00:00:00');
  const hoy   = new Date();
  hoy.setHours(0, 0, 0, 0);
  const esFuturo = fecha >= hoy;

  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const diaCorto = fecha.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
  });

  return (
    <div className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
      esFuturo
        ? 'bg-white border-slate-200 hover:border-indigo-300'
        : 'bg-slate-50 border-slate-100 opacity-70'
    }`}>
      {/* Fecha */}
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
          esFuturo
            ? 'bg-indigo-50 text-indigo-900'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {diaCorto}
        </span>
        {!esFuturo && (
          <span className="text-[10px] text-slate-900 font-bold uppercase">Pasado</span>
        )}
      </div>

      {/* Ministerio */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-purple-400 flex items-center justify-center">
          <i className="fas fa-sitemap text-purple-500 text-[10px]"></i>
        </div>
        <span className="text-s font-black text-purple-600 uppercase tracking-wider">
          {turno.nombreMinisterio}
        </span>
      </div>

      {/* Posición */}
      <div className="font-bold text-slate-800 text-xl mb-2">
        {turno.posicion}
      </div>

      {/* Encargado */}
      <div className="flex items-center gap-1.5 text-slate-800">
        <i className="fas fa-user-shield text-[20px]"></i>
        <span className="text-[20px] font-bold">{turno.encargado}</span>
      </div>

      {/* Fecha completa al fondo */}
      <div className="mt-3 pt-3 border-t border-slate-00">
        <span className="text-[15px] text-slate-900 capitalize">{fechaFormateada}</span>
      </div>
    </div>



  );
}

// ─── Sección de programación ──────────────────────────────────────────────────

function MiProgramacion({ schedule, loading, error }) {

  const [filtro, setFiltro] = useState('proximos'); // 'proximos' | 'todos'

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const ordenados = useMemo(() => {
    if (!Array.isArray(schedule)) return [];
    return [...schedule].sort((a, b) =>
      new Date(a.fechaServcio) - new Date(b.fechaServcio)
    );
  }, [schedule]);

  const filtrados = useMemo(() => {
    if (filtro === 'proximos') {
      return ordenados.filter(t => new Date(t.fechaServcio + 'T00:00:00') >= hoy);
    }
    return ordenados;
  }, [ordenados, filtro]);

  // Agrupar por mes
  const porMes = useMemo(() => {
    const grupos = {};
    filtrados.forEach(turno => {
      const key = new Date(turno.fechaServcio + 'T00:00:00')
        .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(turno);
    });
    return grupos;
  }, [filtrados]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-calendar-alt text-indigo-500"></i>
          Mi Programación
        </h3>        
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-slate-400 text-sm">Cargando turnos...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-10 bg-red-50 rounded-xl border border-red-100">
          <i className="fas fa-exclamation-triangle text-red-300 text-2xl mb-2 block"></i>
          <p className="text-red-400 text-sm">No se pudo cargar la programación</p>
        </div>
      )}

      {/* Vacío */}
      {!loading && !error && schedule.length === 0 && (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <i className="fas fa-calendar-times text-slate-300 text-3xl mb-3 block"></i>
          <p className="text-slate-400 text-sm">
            {filtro === 'proximos'
              ? 'No tienes turnos próximos programados.'
              : 'No tienes turnos registrados.'}
          </p>
        </div>
      )}

      {/* Lista agrupada por mes */}
      {!loading && !error && schedule.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {schedule.map((turno, idx) => (
    <TurnoCard
      key={`${turno.fechaServcio}-${turno.idMinisterio}-${idx}`}
      turno={turno}
    />
  ))}
</div>
        </div>
      )}
    </div>
  );
}

// ─── Vista del perfil ─────────────────────────────────────────────────────────

function ProfileView({ user, schedule, scheduleLoading, scheduleError }) {

  const ministerios = useMemo(() => {
    if (!user?.ministry) return [];
    if (Array.isArray(user.ministry)) return user.ministry;
    return [user.ministry];
  }, [user?.ministry]);

  const initials = useMemo(() => {
    return (user?.name ?? '?')
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [user?.name]);

  return (
    <div className="space-y-6">

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover"
              />
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
              {ministerios.map((m, i) => (
                <span key={i} className="text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-100">
                  <i className="fas fa-sitemap mr-1 text-[10px]"></i>{m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Contacto ────────────────────────────────────────────────── */}
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

      {/* ─── Programación ────────────────────────────────────────────── */}
      <MiProgramacion
        schedule={schedule}
        loading={scheduleLoading}
        error={scheduleError}
      />

    </div>
  );
}

// ─── Componente raíz con fetch ────────────────────────────────────────────────

const Profile = () => {
  const { authFetch, authUser } = useAuth();

  const [user, setUser]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [schedule, setSchedule]           = useState([]);
  const [scheduleLoading, setSchLoading]  = useState(true);
  const [scheduleError, setSchError]      = useState(false);

  // Fetch datos del usuario
  useEffect(() => {
    if (!authUser) return;
    authFetch(API_USER)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data))
      .catch(() => setUser({
        name:     authUser?.nombre ?? 'Usuario',
        role:     authUser?.rol    ?? 'Servidor',
        email:    '',
        phone:    '',
        avatar:   null,
        ministry: [],
      }))
      .finally(() => setLoading(false));
  }, [authUser]);

  // Fetch programación personal — pasa el id en la URL
  /*useEffect(() => {
    if (!authUser) return;
    const id = authUser?.id;
    if (!id) {
      setSchError(true);
      setSchLoading(false);
      return;
    }
    setSchLoading(true);
    authFetch(`${API_SCHEDULE}/${id}`)
     fetch(`${API_SCHEDULE}/${id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setSchedule(Array.isArray(data) ? data : []);
        setSchError(false);
      })
      .catch(() => setSchError(true))
      .finally(() => setSchLoading(false));
  }, [authUser]);
  */

  useEffect(() => {
    if (!authUser) return;
    const id = authUser?.id;
   // fetch(`https://jscamp-api.vercel.app/api/jobs/${activeMinistry?.id}`)
    fetch(`https://anunciaig.com/api/schedule/persona/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al cargar el ministerio: ${response.statusText}`);
        }

        return response.json()
      })
      .then(json => {
        setSchedule(json)
        setSchLoading(false)
      })
      .catch(err => {
        setSchError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [authUser])

  if (loading) return <ProfileLoader />;
  if (!user)   return null;

  return (
    <ProfileView
      user={user}
      schedule={schedule}
      scheduleLoading={scheduleLoading}
      scheduleError={scheduleError}
    />
  );
};

export default Profile;