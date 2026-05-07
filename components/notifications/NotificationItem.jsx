export default function NotificationItem({ notification, onRead }) {
  const { id, titulo, mensaje, tipo, fechaServicio, leida, fechaCreacion } = notification;

  const getIcono = () => {
    switch (tipo) {
      case 'assignment':
        return 'fa-user-plus text-emerald-500';
      case 'reminder':
        return 'fa-clock text-amber-500';
      case 'coordinator':
        return 'fa-user-tie text-indigo-500';
      default:
        return 'fa-bell text-slate-500';
    }
  };

  const getTiempo = () => {
    if (!fechaCreacion) return '';
    const fecha = new Date(fechaCreacion);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMins / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    if (diffDias < 7) return `Hace ${diffDias} días`;
    return fecha.toLocaleDateString('es-ES');
  };

  const handleClick = () => {
    if (!leida) {
      onRead();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!leida ? 'bg-indigo-50/50' : ''}`}
    >
      <div className="flex gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!leida ? 'bg-indigo-100' : 'bg-slate-100'}`}>
          <i className={`fas ${getIcono()} ${!leida ? 'text-indigo-600' : 'text-slate-400'}`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`font-bold text-sm ${!leida ? 'text-slate-800' : 'text-slate-500'}`}>
              {titulo}
            </span>
            {!leida && (
              <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5"></span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mensaje}</p>
          {fechaServicio && (
            <p className="text-[10px] text-slate-400 mt-2">
              <i className="fas fa-calendar-alt mr-1"></i>
              {fechaServicio}
            </p>
          )}
          <p className="text-[10px] text-slate-300 mt-1">{getTiempo()}</p>
        </div>
      </div>
    </div>
  );
}