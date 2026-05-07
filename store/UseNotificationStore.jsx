import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      initialized: false,

      setNotifications: (notifications) => set({ 
        notifications,
        unreadCount: notifications.filter(n => !n.leida).length 
      }),

      markAsRead: (id) => set((state) => {
        const updatedNotifications = state.notifications.map(n => 
          n.id === id ? { ...n, leida: true } : n
        );
        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.leida).length
        };
      }),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, leida: true })),
        unreadCount: 0
      })),

      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      })),

      setInitialized: (value) => set({ initialized: value }),

      clearAll: () => set({ notifications: [], unreadCount: 0 })
    }),
    { name: 'notifications-storage' }
  )
);