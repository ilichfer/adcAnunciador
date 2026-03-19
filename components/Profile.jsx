


import { useMemo } from 'react';

const Profile = ({ user, events = [] }) => {
  const personalSchedule = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Mes siguiente
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextMonth = nextMonthDate.getMonth();
    const nextMonthYear = nextMonthDate.getFullYear();

    return events.filter(event => {
      const eventDate = new Date(event.date + 'T00:00:00');
      const isCorrectMonth = (
        (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) ||
        (eventDate.getMonth() === nextMonth && eventDate.getFullYear() === nextMonthYear)
      );

      if (!isCorrectMonth) return false;

      // Verificar si el usuario está en alguna posición de algún ministerio
      return Object.values(event.ministries).some(positions => 
        positions.some(asgn => asgn.personName === user.name)
      );
    }).map(event => {
      // Extraer las posiciones específicas del usuario en este evento
      const userAssignments = [];
      Object.entries(event.ministries).forEach(([minName, positions]) => {
        positions.forEach(asgn => {
          if (asgn.personName === user.name) {
            userAssignments.push({ ministry: minName, position: asgn.position });
          }
        });
      });
      return { ...event, userAssignments };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, user.name]);

  const groupedByMonth = useMemo(() => {
    const groups = {};
    personalSchedule.forEach(item => {
      const date = new Date(item.date + 'T00:00:00');
      const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      if (!groups[monthName]) groups[monthName] = [];
      groups[monthName].push(item);
    });
    return groups;
  }, [personalSchedule]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-4">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-indigo-600 font-medium">{user.role} • {user.ministry}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4"><i className="fas fa-id-card mr-2 text-indigo-500"></i>Contacto</h3>
          <p className="text-slate-600"><i className="fas fa-envelope mr-2 w-5"></i>{user.email}</p>
          <p className="text-slate-600 mt-2"><i className="fas fa-phone mr-2 w-5"></i>{user.phone}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4"><i className="fas fa-medal mr-2 text-indigo-500"></i>Habilidades</h3>
          <div className="flex flex-wrap gap-2">
            {['Voz', 'Guitarra', 'Liderazgo'].map(s => (
              <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <i className="fas fa-calendar-alt text-indigo-500"></i>
          Mi Programación
        </h3>
        
        {personalSchedule.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
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
                        <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
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
};

export default Profile;
