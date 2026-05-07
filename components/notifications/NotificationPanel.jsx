import { useEffect } from 'react';
import { useNotificationStore } from '../../store/UseNotificationStore';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

export default function NotificationPanel({ onClose }) {
  const { notifications } = useNotificationStore();
  const { markAsReadApi, markAllAsReadApi, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications?.();
  }, []); // Se cambia la dependencia para evitar bucles infinitos si la función no es estable

  const handleMarkAsRead = async (id) => {
    await markAsReadApi(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadApi();
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.leida).length;

  return (
    <div className="w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-[60] max-h-[500px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fas fa-bell text-indigo-600"></i>
          <span className="font-bold text-slate-800">
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {unreadCount} sin leer
              </span>
            )}
          </span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Marcar todo leído
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 max-h-[400px]">
        {safeNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <i className="fas fa-bell-slash text-3xl mb-3 opacity-50"></i>
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {safeNotifications.slice(0, 20).map((notificacion) => (
              <NotificationItem
                key={notificacion.id}
                notification={notificacion} // Se corrige el nombre de la prop de 'notificacion' a 'notification'
                onRead={() => handleMarkAsRead(notificacion.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-100 text-center">
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}