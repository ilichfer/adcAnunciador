import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

// ── Constantes ────────────────────────────────────────────────────────────────
const INACTIVITY_MS   = 5 * 60 * 1000; // 5 min sin actividad → mostrar advertencia
const WARNING_MS      =      30 * 1000; // 30 seg para responder antes de cerrar
const INACT_CHECK     =       5 * 1000; // tick del timer de inactividad (cada 5s)

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
const STORAGE_KEYS    = ['adc_token', 'adc_rol', 'adc_nombre', 'adc_id', 'adc_last_activity'];

// ─── Modal: sesión cerrada por inactividad ────────────────────────────────────

function SessionExpiredModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <i className="fas fa-user-slash text-slate-400 text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Sesión cerrada</h2>
            <p className="text-slate-500 text-sm">
              Tu sesión se cerró por 5 minutos de inactividad.
              Por seguridad, debes iniciar sesión nuevamente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Banner: advertencia con cuenta regresiva de 30 segundos ─────────────────

function InactivityWarningBanner({ onContinue }) {
  // Estado propio con tick cada segundo — cuenta regresiva en vivo
  const [secondsLeft, setSecondsLeft] = useState(WARNING_MS / 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Porcentaje para la barra de progreso
  const pct    = (secondsLeft / (WARNING_MS / 1000)) * 100;
  const urgent = secondsLeft <= 10;

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center pb-6 px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm animate-in slide-in-from-bottom-4 duration-300">
        <div className={`rounded-2xl border shadow-2xl overflow-hidden transition-colors duration-500 ${
          urgent
            ? 'bg-rose-50 border-rose-200'
            : 'bg-slate-800 border-slate-700'
        }`}>

          {/* Barra de progreso superior */}
          <div className="h-1 w-full bg-black/10">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${urgent ? 'bg-rose-500' : 'bg-indigo-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              urgent ? 'bg-rose-100' : 'bg-white/10'
            }`}>
              <i className={`fas fa-user-clock text-lg ${urgent ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}></i>
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${urgent ? 'text-rose-800' : 'text-white'}`}>
                ¿Sigues ahí?
              </p>
              <p className={`text-xs ${urgent ? 'text-rose-600' : 'text-slate-400'}`}>
                La sesión se cerrará en{' '}
                <span className={`font-black tabular-nums ${urgent ? 'text-rose-600' : 'text-amber-400'}`}>
                  {secondsLeft}s
                </span>
                {' '}por inactividad
              </p>
            </div>

            <button
              onClick={onContinue}
              className={`text-xs font-black uppercase tracking-wider text-white px-4 py-2 rounded-xl transition-all flex-shrink-0 ${
                urgent
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200'
                  : 'bg-indigo-500 hover:bg-indigo-400'
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {

  const [authUser, setAuthUser] = useState(() => {
    const token        = localStorage.getItem('adc_token');
    const rol          = localStorage.getItem('adc_rol');
    const nombre       = localStorage.getItem('adc_nombre');
    const id           = localStorage.getItem('adc_id');
    const lastActivity = localStorage.getItem('adc_last_activity');

    if (!token) return null;

    // Si ya estaba inactivo al recargar, limpiar directamente
    if (lastActivity && Date.now() - Number(lastActivity) >= INACTIVITY_MS + WARNING_MS) {
      STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
      return null;
    }

    return { token, rol, nombre, id };
  });

  const [showExpired, setShowExpired]   = useState(false);
  const [showWarning, setShowWarning]   = useState(false);
  const inactivityRef                   = useRef(null);
  const warningRef                      = useRef(null); // timer de los 30s

  // ── clearSession ──────────────────────────────────────────────────────────

  const clearSession = useCallback(() => {
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    clearTimeout(warningRef.current);
    setAuthUser(null);
    setShowWarning(false);
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────

  const login = useCallback((data) => {
    const now = String(Date.now());
    localStorage.setItem('adc_token',         data.token);
    localStorage.setItem('adc_rol',           data.rol);
    localStorage.setItem('adc_nombre',        data.nombre ?? '');
    localStorage.setItem('adc_id',            data.id     ?? '');
    localStorage.setItem('adc_last_activity', now);
    setAuthUser(data);
    setShowExpired(false);
    setShowWarning(false);
  }, []);

  // ── logout manual ─────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    clearSession();
    setShowExpired(false);
  }, [clearSession]);

  // ── registerActivity: cualquier evento del usuario ────────────────────────

  const registerActivity = useCallback(() => {
    if (!localStorage.getItem('adc_token')) return;
    localStorage.setItem('adc_last_activity', String(Date.now()));
    setShowWarning(false);
    // Cancelar el timer de cierre automático si estaba corriendo
    clearTimeout(warningRef.current);
  }, []);

  // ── Listeners de eventos de actividad (throttle 10s) ─────────────────────

  useEffect(() => {
    if (!authUser) return;
    let lastWrite = Date.now();
    const handler = () => {
      const now = Date.now();
      if (now - lastWrite < 10_000) return; // throttle
      lastWrite = now;
      registerActivity();
    };
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, handler));
  }, [authUser, registerActivity]);

  // ── Timer de inactividad ──────────────────────────────────────────────────

  useEffect(() => {
    if (!authUser) {
      clearInterval(inactivityRef.current);
      setShowWarning(false);
      return;
    }

    const check = () => {
      const last = Number(localStorage.getItem('adc_last_activity'));
      if (!last) return;

      const idle = Date.now() - last;

      if (idle >= INACTIVITY_MS && !showWarning) {
        // Pasaron 5 min sin actividad → mostrar banner
        setShowWarning(true);

        // Timer de 30s para cerrar si no responde
        clearTimeout(warningRef.current);
        warningRef.current = setTimeout(() => {
          clearSession();
          setShowExpired(true);
        }, WARNING_MS);
      }
    };

    check();
    inactivityRef.current = setInterval(check, INACT_CHECK);
    return () => {
      clearInterval(inactivityRef.current);
      clearTimeout(warningRef.current);
    };
  }, [authUser, showWarning, clearSession]);

  // ── authFetch: intercepta 401 ─────────────────────────────────────────────

  const authFetch = useCallback((url, options = {}) => {
    // Si el body es FormData NO inyectar Content-Type — el browser lo pone
    // automáticamente con el boundary correcto para multipart/form-data
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
      ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {}),
    };

    return fetch(url, { ...options, headers })
      .then(res => {
        if (res.status === 401) {
          clearSession();
          setShowExpired(true);
        }
        return res;
      });
  }, [authUser, clearSession]);

  const isAdmin    = authUser?.rol === 'ADMIN';
  const isServidor = authUser?.rol === 'SERVIDOR' || authUser?.rol === 'USER';
  const isUsuario  = authUser?.rol === 'USUARIO';

  return (
    <AuthContext.Provider value={{
      authUser,
      login,
      logout,
      authFetch,
      isAdmin,
      isServidor,
      isUsuario,
    }}>
      {children}

      {/* Modal: sesión ya cerrada */}
      {showExpired && (
        <SessionExpiredModal onClose={() => setShowExpired(false)} />
      )}

      {/* Banner: 30 segundos para responder */}
      {showWarning && !showExpired && (
        <InactivityWarningBanner onContinue={registerActivity} />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};