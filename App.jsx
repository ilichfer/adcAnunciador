import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Header from './components/Header.jsx';
import Profile from './components/Profile.jsx';
import Schedule from './components/Schedule.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import UsersManager from './components/UsersManager.jsx';
import TCDManager from './components/TCDManager.jsx';
import Reports from './components/Reports.jsx';
import MinistryManager from './components/MinistryManager.jsx';
import Contact from './components/Contact.jsx';
import Login from './components/Login.jsx';
import { useAuth } from './context/AuthContext.jsx';

function AppLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-500 font-medium">Cargando aplicación...</p>
    </div>
  );
}

const API_BASE = '/api';

const App = () => {
  const { authUser, logout, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading]     = useState(true); // ← empieza en true
  const [appData, setAppData]     = useState({
    user:        null,
    users:       [],
    tcdEntries:  [],
    events:      [],
    ministries:  [],
  });

  const mapearUsuario = (p) => ({
    ...p,
    avatar:   p.avatar ?? null,
    active:   p.active === true,
    role:     p.role ?? 'Servidor',
    ministry: p.ministry ?? '',
  });

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.allSettled([
      authFetch(`${API_BASE}/user`).then(r => r.json()),
      authFetch(`${API_BASE}/users`).then(r => r.json()),
      authFetch(`${API_BASE}/events`).then(r => r.json()),
      authFetch(`${API_BASE}/ministries`).then(r => r.json()),
      authFetch(`${API_BASE}/tcd`).then(r => r.json()),
    ]).then(([user, users, events, ministries, tcd]) => {
      setAppData({
        user:       user.status       === 'fulfilled' ? user.value       : null,
        users:      users.status      === 'fulfilled'
                      ? (Array.isArray(users.value) ? users.value.map(mapearUsuario) : [])
                      : [],
        events:     events.status     === 'fulfilled'
                      ? (Array.isArray(events.value) ? events.value : events.value?.events ?? [])
                      : [],
        ministries: ministries.status === 'fulfilled'
                      ? (Array.isArray(ministries.value) ? ministries.value : [])
                      : [],
        tcdEntries: tcd.status        === 'fulfilled' ? tcd.value        : [],
      });
      setLoading(false);
    });
  }, [authUser]);

  const handleAddUser = useCallback((newUser) => {
    setAppData(prev => ({
      ...prev,
      users: [...prev.users, { ...newUser, id: Date.now().toString(), active: true }],
    }));
  }, []);

  const toggleUserStatus = useCallback((id) => {
    setAppData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, active: !u.active } : u),
    }));
  }, []);

  const addTcdEntry = useCallback((entry) => {
    setAppData(prev => ({
      ...prev,
      tcdEntries: [...prev.tcdEntries, { ...entry, id: Date.now().toString() }],
    }));
  }, []);

  const handleAddEvent = useCallback((newEvent) => {
    setAppData(prev => ({ ...prev, events: [newEvent, ...prev.events] }));
    setActiveTab('schedule');
  }, []);

  if (!authUser) return <Login />;
  if (loading)   return <AppLoader />;

  const { user, users, tcdEntries, events, ministries } = appData;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onLogout={logout} userName={authUser?.nombre} rol={authUser?.rol} />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'profile' && <Profile events={events} />}
        {activeTab === 'schedule' && (
          <ErrorBoundary><Schedule /></ErrorBoundary>
        )}
        {activeTab === 'users' && (
          <UsersManager
            users={users}
            onAddUser={handleAddUser}
            onToggleStatus={toggleUserStatus}
          />
        )}
        {activeTab === 'tcd' && (
          <TCDManager
            tcdEntries={tcdEntries}
            onAddEntry={addTcdEntry}
            currentUser={user}
          />
        )}
        {activeTab === 'reports' && (
          <Reports users={users} tcdEntries={tcdEntries} />
        )}
        {activeTab === 'ministries' && (
          <MinistryManager
            ministries={ministries}
            users={users}
            onAddEvent={handleAddEvent}
          />
        )}
        {activeTab === 'contact' && <Contact />}
      </main>
      <footer className="mt-20 border-t border-slate-200 py-10 text-center text-slate-400 text-sm">
        <p>© 2026 ADC — Gestión Eclesiástica Digital</p>
      </footer>
    </div>
  );
};

export default App;