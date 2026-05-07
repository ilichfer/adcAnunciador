import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '../store/UseNotificationStore';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../components/useApi';

export function useNotifications() {
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { authUser, authFetch } = useAuth();
  const { getUrl } = useApi();

  const fetchNotifications = useCallback(async () => {
    if (!authUser?.id) return;
    
    try {
      const res = await authFetch(getUrl(`/notificaciones/${authUser.id}`));
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  }, [authUser?.id, authFetch, getUrl, setNotifications]);

  const checkAndShowToast = useCallback(async () => {
    if (!authUser?.id) return null;

    try {
      const res = await authFetch(getUrl(`/notificaciones/${authUser.id}/no-leidas`));
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setNotifications(data);
          return data[0];
        }
      }
    } catch (error) {
      console.error('Error en checkAndShowToast:', error);
    }
    return null;
  }, [authUser?.id, authFetch, getUrl, setNotifications]);

  const markAsReadApi = useCallback(async (idNotificacion) => {
    try {
      const res = await authFetch(getUrl(`/notificaciones/${idNotificacion}/leida`), {
        method: 'PUT'
      });
      if (res.ok) {
        markAsRead(idNotificacion);
        return true;
      }
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
    return false;
  }, [authFetch, getUrl, markAsRead]);

  const markAllAsReadApi = useCallback(async () => {
    if (!authUser?.id) return;
    
    try {
      const res = await authFetch(getUrl(`/notificaciones/${authUser.id}/leer-todas`), {
        method: 'PUT'
      });
      if (res.ok) {
        markAllAsRead();
        return true;
      }
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
    return false;
  }, [authUser?.id, authFetch, getUrl, markAllAsRead]);

  useEffect(() => {
    if (authUser?.id) {
      fetchNotifications();
    }
  }, [authUser?.id]);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    checkAndShowToast,
    markAsReadApi,
    markAllAsReadApi
  };
}