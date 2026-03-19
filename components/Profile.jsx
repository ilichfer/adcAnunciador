import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = 'https://anunciaig.com/api/user';

// ─── Loader ───────────────────────────────────────────────────────────────────

function ProfileLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-400 text-sm font-medium">Cargando perfil...</p>
    </div>
  );
}

// ─── Perfil ───────────────────────────────────────────────────────────────────

function ProfileView({ user, events = [] }) {

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

  const personalSchedule = useMemo(() => {
    if (!user?.name || !Array.isArray(events)) return [];

    const now           = new Date();
    const currentMonth  = now.getMonth();
    const currentYear   = now.getFullYear();
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextMonth     = nextMonthDate.getMonth();
    const nextMonthYear = nextMonthDate.getFullYear();

    return events
      .filter(event => {
        const d = new Date(event.date + 'T00:00:00');
        const inRange =
          (d.getMonth() === currentMonth && d.getFullYear() === currentYear) ||
          (d.getMonth() === nextMonth     && d.getFullYear() === nextMonthYear);
        if (!inRange) return false;

        const mins = Array.isArray(event.ministries) ? event.ministries : [];
        return mins.some(minObj =>
          Object.values(minObj).flat().some(a => a.personName === user.name)
        );
      })
      .map(event => {
        const userAssignments = [];
        (Array.isArray(event.ministries) ? event.ministries : []).forEach(minObj => {
          Object.entries(minObj).forEach(([minName, positions]) => {
            positions.forEach(asgn => {
              if (asgn.personName === user.name)
                userAssignments.push({ ministry: minName, position: asgn.position });
            });
          });
        });
        return { ...event, userAssignments };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, user?.name]);

  const groupedByMonth = useMemo(() => {
    const groups = {};
    personalSchedule.forEach(item => {
      const key = new Date(item.date + 'T00:00:00')
        .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [personalSchedule]);

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

      {/* ─── Programación personal ───────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <i className="fas fa-calendar-alt text-indigo-500"></i>
          Mi Programación
        </h3>

        {personalSchedule.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <i className="fas fa-calendar-times text-slate-300 text-3xl mb-3 block"></i>
            <p className="text-slate-400 text-sm">No tienes actividades programadas para este mes ni el próximo.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByMonth).map(([month, items]) => (
              <div key={month} className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                  {month}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(item => (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                          {new Date(item.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                        </span>
                        {item.time && (
                          <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {item.userAssignments.map((asgn, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{asgn.ministry}</span>
                            <span className="text-sm font-bold text-slate-700">{asgn.position}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Componente raíz con fetch ────────────────────────────────────────────────

const Profile = ({ events = [] }) => {
  const { authFetch, authUser } = useAuth();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!authUser) return;
    setLoading(true);

    authFetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [authUser]);

  if (loading) return <ProfileLoader />;

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-1">
        <i className="fas fa-exclamation-triangle"></i>
        <h3 className="font-bold">Error al cargar el perfil</h3>
      </div>
      <p className="text-sm">{error}</p>
    </div>
  );

  if (!user) return null;

  return <ProfileView user={user} events={events} />;
};

export default Profile;