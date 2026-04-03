// App.jsx — con control de acceso por rol
// ADMIN   → ve todas las vistas
// SERVIDOR → solo profile, schedule, tcd, reports

import { useEffect } from 'react';
import Navbar          from './components/Navbar.jsx';
import Header          from './components/Header.jsx';
import Profile         from './components/Profile.jsx';
import Schedule        from './components/Schedule.jsx';
import ErrorBoundary   from './components/ErrorBoundary.jsx';
import UsersManager    from './components/UsersManager.jsx';
import TCDManager      from './components/TCDManager.jsx';
import Reports         from './components/Reports.jsx';
import MinistryManager from './components/MinistryManager.jsx';
import ServiceSearch   from './components/ServiceSearch.jsx';
import Contact         from './components/Contact.jsx';
import Login           from './components/Login.jsx';
import { useAuth }     from './context/AuthContext.jsx';
import { useAppStore } from './store/UseAppStore.jsx';

function AppLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-500 font-medium">Cargando aplicación...</p>
    </div>
  );
}

// Pantalla cuando un servidor intenta acceder a una ruta restringida
function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
        <i className="fas fa-lock text-rose-300 text-3xl"></i>
      </div>
      <h2 className="text-xl font-bold text-slate-700">Acceso restringido</h2>
      <p className="text-slate-400 text-sm max-w-xs">
        No tienes permisos para ver esta sección.
      </p>
    </div>
  );
}

// ── Tabs permitidos por rol ───────────────────────────────────────────────────
const ADMIN_TABS  = new Set(['profile', 'schedule', 'tcd', 'reports', 'service-search', 'ministries', 'users', 'contact']);
const SERVER_TABS = new Set(['profile', 'schedule', 'tcd']); // 'reports' solo ADMIN

const App = () => {
  const { authUser, logout, isAdmin } = useAuth();

  const activeTab    = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const loading      = useAppStore(s => s.loading);
  const fetchAppData = useAppStore(s => s.fetchAppData);
  const resetAppData = useAppStore(s => s.resetAppData);

  const allowedTabs = isAdmin ? ADMIN_TABS : SERVER_TABS;

  useEffect(() => {
    if (authUser) {
      fetchAppData(authUser.token);
    } else {
      resetAppData();
    }
  }, [authUser]);

  // Si el tab activo no está permitido para el rol, redirige a schedule
  useEffect(() => {
    if (authUser && !allowedTabs.has(activeTab)) {
      setActiveTab('schedule');
    }
  }, [authUser, activeTab]);

  const handleLogout = () => {
    logout();
    resetAppData();
  };

  if (!authUser) return <Login />;
  if (loading)   return <AppLoader />;

  const canView   = (tab) => allowedTabs.has(tab);
  const currentTab = canView(activeTab) ? activeTab : 'schedule';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onLogout={handleLogout}
        userName={authUser?.nombre}
        rol={authUser?.rol}
      />
      <Navbar activeTab={currentTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Vistas comunes (todos los roles) ─────────────────────────── */}
        {currentTab === 'profile'  && <Profile />}
        {currentTab === 'schedule' && <ErrorBoundary><Schedule /></ErrorBoundary>}
        {currentTab === 'tcd'      && <TCDManager />}
        {currentTab === 'reports'  && <Reports />}

        {/* ── Vistas solo ADMIN ─────────────────────────────────────────── */}
        {currentTab === 'service-search' && (canView('service-search') ? <ServiceSearch />   : <Unauthorized />)}
        {currentTab === 'users'          && (canView('users')          ? <UsersManager />    : <Unauthorized />)}
        {currentTab === 'ministries'     && (canView('ministries')     ? <MinistryManager /> : <Unauthorized />)}
        {currentTab === 'contact'        && (canView('contact')        ? <Contact />         : <Unauthorized />)}

      </main>

      <footer className="mt-20 border-t border-slate-200 py-10 text-center text-slate-400 text-sm">
        <p>© 2026 ADC — Gestión Eclesiástica Digital</p>
      </footer>
    </div>
  );
};

export default App;