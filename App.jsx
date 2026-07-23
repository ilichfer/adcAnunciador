// App.jsx — con control de acceso por rol
// ADMIN   → ve todas las vistas
// SERVIDOR → solo profile, schedule, tcd, reports

import { useEffect, useState, useMemo, useRef } from 'react';
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
import ContactAdmin    from './components/ContactAdmin.jsx';
import Login           from './components/Login.jsx';
import LandingPage     from './components/LandingPage.jsx';
import CoordinatorReport from './components/CoordinatorReport.jsx';
import BirthdayManager  from './components/BirthdayManager.jsx';
import MonthlyImageManager from './components/MonthlyImageManager.jsx';
import CursosManager      from './components/CursosManager.jsx';
import NotificationToast from './components/notifications/NotificationToast.jsx';
import { useAuth }     from './context/AuthContext.jsx';
import { useAppStore } from './store/UseAppStore.jsx';
import { useNotifications } from './hooks/useNotifications.js';
import { useApi } from './components/useApi.js';

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
const ADMIN_TABS  = new Set(['profile', 'schedule', 'tcd', 'reports', 'service-search', 'ministries', 'users', 'birthdays', 'monthly-image', 'contact-admin', 'cursos']);
const SERVER_TABS = new Set(['profile', 'schedule', 'tcd', 'birthdays']); // 'reports' solo ADMIN

const App = () => {
  const { authUser, logout, isAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const { getUrl } = useApi();

  const activeTab    = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const loading      = useAppStore(s => s.loading);
  const events       = useAppStore(s => s.events);
  const fetchAppData = useAppStore(s => s.fetchAppData);
  const resetAppData = useAppStore(s => s.resetAppData);
  
  const { checkAndShowToast } = useNotifications();

  // Debug log para monitorear la llegada de eventos desde el Store
  useEffect(() => {
    console.log("DEBUG [App.jsx] - Estado actual de events:", events);
  }, [events]);

  // Validar si el usuario es coordinador el día de hoy
  const isCoordinatorToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events.some(e => 
      e.date === today && 
      String(e.coordinator?.id) === String(authUser?.id)
    );
  }, [events, authUser]);

  // Construir set de tabs permitidos dinámicamente
  const allowedTabs = useMemo(() => {
    const tabs = new Set(isAdmin ? ADMIN_TABS : SERVER_TABS);
    if (isCoordinatorToday) tabs.add('coordinator-report');
    return tabs;
  }, [isAdmin, isCoordinatorToday]);

  useEffect(() => {
    if (authUser) {
      fetchAppData(authUser.token);
    } else {
      resetAppData();
    }
  }, [authUser]);

  // Verificar notificaciones y mostrar toast (solo una vez al cargar)
  const notificationChecked = useRef(false);
  useEffect(() => {
    if (authUser && !notificationChecked.current) {
      notificationChecked.current = true;
      const loadNotifications = async () => {
        try {
          const res = await fetch(getUrl(`/notificaciones/${authUser.id}/no-leidas`), {
            headers: { 'Authorization': `Bearer ${authUser.token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
              setToastNotification(data[0]);
            }
          }
        } catch (err) {
          console.error('Error notificaciones:', err);
        }
      };
      loadNotifications();
    }
  }, [authUser]);

  const closeToast = () => setToastNotification(null);

  // Si el tab activo no está permitido para el rol, redirige a schedule
  useEffect(() => {
    if (authUser && !allowedTabs.has(activeTab)) {
      setActiveTab('schedule');
    }
  }, [authUser, activeTab]);

  const handleLogout = () => {
    logout();
    resetAppData();
    setShowLogin(false); // Al cerrar sesión, vuelve a la LandingPage
  };

  if (!authUser) {
    if (showLogin) {
      return <Login onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }
  if (loading)   return <AppLoader />;

  const canView   = (tab) => allowedTabs.has(tab);
  const currentTab = canView(activeTab) ? activeTab : 'schedule';

  return (
    <div className="min-h-screen bg-slate-50">
      {toastNotification && (
        <NotificationToast 
          notification={toastNotification} 
          onClose={closeToast} 
        />
      )}
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
        {currentTab === 'birthdays' && <BirthdayManager />}
        {currentTab === 'coordinator-report' && <CoordinatorReport />}


        {/* ── Vistas solo ADMIN ─────────────────────────────────────────── */}
        {currentTab === 'service-search' && (canView('service-search') ? <ServiceSearch />   : <Unauthorized />)}
        {currentTab === 'users'          && (canView('users')          ? <UsersManager />    : <Unauthorized />)}
        {currentTab === 'ministries'     && (canView('ministries')     ? <MinistryManager /> : <Unauthorized />)}
        {currentTab === 'monthly-image'  && (canView('monthly-image')  ? <MonthlyImageManager /> : <Unauthorized />)}
        {currentTab === 'contact-admin'  && (canView('contact-admin')  ? <ContactAdmin />         : <Unauthorized />)}
        {currentTab === 'cursos'         && (canView('cursos')         ? <CursosManager />         : <Unauthorized />)}

      </main>

      <footer className="mt-20 border-t border-slate-200 py-10 text-center text-slate-400 text-sm">
        <p>© 2026 ADC — Gestión Eclesiástica Digital</p>
      </footer>
    </div>
  );
};

export default App;