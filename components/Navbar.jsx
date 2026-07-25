import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAppStore } from '../store/UseAppStore.jsx';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { isAdmin, authUser } = useAuth();
  const events = useAppStore(s => s.events);
  const [isOpen, setIsOpen]             = useState(false);
  const [showTcdSubmenu, setShowTcdSubmenu] = useState(false);
  const submenuRef = useRef(null);

  // Validar si el usuario es coordinador el día de hoy
  const today = new Date().toISOString().split('T')[0];
  const isCoordinatorToday = events.some(e => 
    e.date === today && 
    String(e.coordinator?.id) === String(authUser?.id)
  );

  // ── Tabs por rol ────────────────────────────────────────────────────────────
  // Tabs que VE cualquier usuario (SERVIDOR / ADMIN)
  const commonTabs = [
    { id: 'schedule',       label: 'Programación',      icon: 'fa-calendar-alt' },
    { id: 'birthdays',      label: 'Cumpleaños',        icon: 'fa-cake-candles' },
    { id: 'profile',        label: 'Mi Perfil',          icon: 'fa-user' },
    {
      id: 'tcd-root',
      label: 'TCD',
      icon: 'fa-book-open',
      hasSubmenu: true,
      submenu: [
        { id: 'tcd', label: 'Mi TCD', icon: 'fa-upload' },
        // Reportes TCD solo visible para ADMIN
        ...(isAdmin ? [{ id: 'reports', label: 'Reportes TCD', icon: 'fa-chart-bar' }] : []),
      ],
    },
    // Nueva opción dinámica para coordinadores
    ...(isCoordinatorToday ? [{ id: 'coordinator-report', label: 'Coordinador', icon: 'fa-user-tie' }] : []),
  ];

  // Tabs EXTRA que solo ve el ADMIN
  const adminTabs = [
    { id: 'service-search', label: 'Consultar Servicios', icon: 'fa-search' },
    { id: 'ministries',     label: 'Ministerios',         icon: 'fa-sitemap' },
    { id: 'users',          label: 'Usuarios',            icon: 'fa-users' },
    { id: 'cursos',         label: 'Cursos',              icon: 'fa-graduation-cap' },
    { id: 'configuracion',  label: 'Configuración',        icon: 'fa-cog' },
    { id: 'monthly-image',  label: 'Imagen del Mes',       icon: 'fa-image' },
    { id: 'contact-admin',  label: 'Contactos',            icon: 'fa-envelope' },
  ];

  // Lista final según rol
  const tabs = isAdmin ? [...commonTabs, ...adminTabs] : commonTabs;

  // ── Cerrar submenu al hacer click fuera ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setShowTcdSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsOpen(false);
    setShowTcdSubmenu(false);
  };

  const isTcdActive = activeTab === 'tcd' || activeTab === 'reports';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="font-black text-xl tracking-tighter text-indigo-600 uppercase">ADC</span>
            {/* Badge de rol */}
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
              isAdmin
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              {isAdmin ? 'Admin' : 'Servidor'}
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex space-x-1 h-full">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className="relative flex items-center h-full"
                ref={tab.hasSubmenu ? submenuRef : null}
              >
                <button
                  onClick={() => {
                    if (tab.hasSubmenu) {
                      setShowTcdSubmenu(!showTcdSubmenu);
                    } else {
                      handleTabClick(tab.id);
                    }
                  }}
                  className={`flex items-center space-x-2 px-3 h-full border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id || (tab.hasSubmenu && isTcdActive)
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-indigo-500'
                  }`}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  <span>{tab.label}</span>
                  {tab.hasSubmenu && (
                    <i className={`fas fa-chevron-down text-[10px] ml-1 transition-transform ${showTcdSubmenu ? 'rotate-180' : ''}`}></i>
                  )}
                </button>

                {tab.hasSubmenu && showTcdSubmenu && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-slate-200 shadow-xl rounded-b-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {tab.submenu.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleTabClick(sub.id)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 hover:bg-slate-50 transition-colors ${
                          activeTab === sub.id ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                        }`}
                      >
                        <i className={`fas ${sub.icon} w-4 text-center`}></i>
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hamburger mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 p-2">
              <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-indigo-600 uppercase tracking-tighter">ADC</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                isAdmin
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                {isAdmin ? 'Admin' : 'Servidor'}
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 p-1">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            {tabs.map(tab => (
              <div key={tab.id} className="flex flex-col">
                <button
                  onClick={() => { if (!tab.hasSubmenu) handleTabClick(tab.id); }}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === tab.id && !tab.hasSubmenu
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${tab.icon} w-5`}></i>
                  <span>{tab.label}</span>
                </button>
                {tab.hasSubmenu && (
                  <div className="ml-9 flex flex-col space-y-1 border-l-2 border-slate-100 pl-4 mt-1">
                    {tab.submenu.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleTabClick(sub.id)}
                        className={`text-left py-2 text-sm flex items-center gap-2 ${
                          activeTab === sub.id ? 'text-indigo-600 font-bold' : 'text-slate-500'
                        }`}
                      >
                        <i className={`fas ${sub.icon} w-4`}></i>
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;