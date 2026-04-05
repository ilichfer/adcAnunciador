/**
 * useAppStore.js
 * Estado global de la aplicación ADC usando Zustand v5.
 *
 * Organizado en slices lógicos:
 *   - app     → loading global y tab activo
 *   - user    → perfil del usuario autenticado
 *   - users   → lista de usuarios / servidores
 *   - events  → eventos de agenda
 *   - tcd     → entradas TCD
 *   - ministries → ministerios
 *   - assignments → asignaciones
 *
 * Uso en cualquier componente:
 *   import { useAppStore } from '../store/useAppStore';
 *   const users = useAppStore(s => s.users);
 *   const addUser = useAppStore(s => s.addUser);
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { API_BASE } from '../components/useApi.js';

// ---------------------------------------------------------------------------
// Helper: construir headers con el token Bearer
// ---------------------------------------------------------------------------
const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ---------------------------------------------------------------------------
// Transformación de usuario (igual que en App.jsx)
// ---------------------------------------------------------------------------
const mapearUsuario = (p) => ({
  ...p,
  avatar:   p.avatar   ?? null,
  active:   p.active   === true,
  role:     p.role     ?? 'Servidor',
  ministry: p.ministry ?? '',
});

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useAppStore = create(
  devtools(
    (set, get) => ({

      // ── Estado inicial ────────────────────────────────────────────────────

      /** Tab activo en la Navbar */
      activeTab: 'schedule',

      /** Carga inicial de datos desde la API */
      loading: false,

      /** Perfil completo del usuario autenticado (de /api/user) */
      user: null,

      /** Lista de todos los usuarios/servidores */
      users: [],

      /** Eventos de agenda */
      events: [],

      /** Entradas TCD */
      tcdEntries: [],

      /** Ministerios */
      ministries: [],

      /** Asignaciones de ministerios */
      assignments: [],

      // ── Acciones de navegación ────────────────────────────────────────────

      setActiveTab: (tab) => set({ activeTab: tab }, false, 'setActiveTab'),

      // ── Carga inicial de datos ────────────────────────────────────────────

      /**
       * Carga todos los datos de la app en paralelo.
       * Llamar desde App.jsx cuando authUser esté disponible.
       *
       * @param {string} token  JWT del usuario autenticado
       */
      fetchAppData: async (token) => {
        set({ loading: true }, false, 'fetchAppData/start');

        const headers = authHeaders(token);

        // safeJson: si el servidor devuelve HTML de error no explota con SyntaxError
        const safeJson = (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json().catch(() => { throw new Error('Respuesta no es JSON'); });
        };

        const [user, users, events, ministries, tcd, assignments] =
          await Promise.allSettled([
            fetch(`${API_BASE}/user`,        { headers }).then(safeJson), // Perfil actual
            fetch(`${API_BASE}/users`,       { headers }).then(safeJson), // Lista de servidores
            fetch(`${API_BASE}/events`,      { headers }).then(safeJson), // Agenda
            fetch(`${API_BASE}/ministries`,  { headers }).then(safeJson), // Estructura
            fetch(`${API_BASE}/tcd`,         { headers }).then(safeJson), // Galería TCD
            fetch(`${API_BASE}/assignments`, { headers }).then(safeJson).catch(() => []), // Especialidades
          ]);

        set(
          {
            loading: false,
            user:        user.status        === 'fulfilled' ? user.value        : null,
            users:       users.status       === 'fulfilled'
                           ? (Array.isArray(users.value) ? users.value.map(mapearUsuario) : [])
                           : [],
            events:      events.status      === 'fulfilled'
                           ? (Array.isArray(events.value) ? events.value : events.value?.events ?? [])
                           : [],
            ministries:  ministries.status  === 'fulfilled'
                           ? (Array.isArray(ministries.value) ? ministries.value : [])
                           : [],
            tcdEntries:  tcd.status         === 'fulfilled' ? tcd.value         : [],
            assignments: assignments.status === 'fulfilled'
                           ? (Array.isArray(assignments.value) ? assignments.value : [])
                           : [],
          },
          false,
          'fetchAppData/success',
        );
      },

      /** Limpia todos los datos (usar al hacer logout) */
      resetAppData: () =>
        set(
          {
            loading: false,
            user: null,
            users: [],
            events: [],
            tcdEntries: [],
            ministries: [],
            assignments: [],
            activeTab: 'schedule',
          },
          false,
          'resetAppData',
        ),

      // ── Acciones: Usuarios ────────────────────────────────────────────────

      /** Carga masiva desde la API (preserva IDs reales) */
      setUsers: (list) =>
        set(
          { users: Array.isArray(list) ? list : [] },
          false,
          'setUsers',
        ),

      addUser: (newUser) =>
        set(
          (state) => ({
            users: [
              ...state.users,
              { ...newUser, id: Date.now().toString(), active: true },
            ],
          }),
          false,
          'addUser',
        ),

      toggleUserStatus: (id) =>
        set(
          (state) => ({
            users: state.users.map((u) =>
              u.id === id ? { ...u, active: !u.active } : u,
            ),
          }),
          false,
          'toggleUserStatus',
        ),

      updateUser: (id, changes) =>
        set(
          (state) => ({
            users: state.users.map((u) =>
              u.id === id ? { ...u, ...changes } : u,
            ),
          }),
          false,
          'updateUser',
        ),

      removeUser: (id) =>
        set(
          (state) => ({ users: state.users.filter((u) => u.id !== id) }),
          false,
          'removeUser',
        ),

      // ── Acciones: Eventos ─────────────────────────────────────────────────

      addEvent: (newEvent) =>
        set(
          (state) => ({ events: [newEvent, ...state.events] }),
          false,
          'addEvent',
        ),

      updateEvent: (id, changes) =>
        set(
          (state) => ({
            events: state.events.map((e) =>
              e.id === id ? { ...e, ...changes } : e,
            ),
          }),
          false,
          'updateEvent',
        ),

      removeEvent: (id) =>
        set(
          (state) => ({ events: state.events.filter((e) => e.id !== id) }),
          false,
          'removeEvent',
        ),

      // ── Acciones: TCD ─────────────────────────────────────────────────────

      addTcdEntry: (entry) =>
        set(
          (state) => ({
            tcdEntries: [
              ...state.tcdEntries,
              { ...entry, id: Date.now().toString() },
            ],
          }),
          false,
          'addTcdEntry',
        ),

      removeTcdEntry: (id) =>
        set(
          (state) => ({
            tcdEntries: state.tcdEntries.filter((t) => t.id !== id),
          }),
          false,
          'removeTcdEntry',
        ),

      // ── Acciones: Ministerios ─────────────────────────────────────────────

      addMinistry: (ministry) =>
        set(
          (state) => ({
            ministries: [...state.ministries, ministry],
          }),
          false,
          'addMinistry',
        ),

      removeMinistry: (id) =>
        set(
          (state) => ({
            ministries: state.ministries.filter((m) => m.id !== id),
          }),
          false,
          'removeMinistry',
        ),

      updateMinistry: (id, changes) =>
        set(
          (state) => ({
            ministries: state.ministries.map((m) =>
              m.id === id ? { ...m, ...changes } : m,
            ),
          }),
          false,
          'updateMinistry',
        ),

      // ── Acciones: Asignaciones ────────────────────────────────────────────

      addAssignment: (assignment) =>
        set(
          (state) => ({
            assignments: [...state.assignments, assignment],
          }),
          false,
          'addAssignment',
        ),

      removeAssignment: (id) =>
        set(
          (state) => ({
            assignments: state.assignments.filter((a) => a.id !== id),
          }),
          false,
          'removeAssignment',
        ),

    }),
    { name: 'ADC-AppStore' }, // aparece en Redux DevTools
  ),
);