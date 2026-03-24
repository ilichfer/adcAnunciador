import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    const token  = localStorage.getItem('adc_token');
    const rol    = localStorage.getItem('adc_rol');
    const nombre = localStorage.getItem('adc_nombre');
    const id     = localStorage.getItem('adc_id');
    return token ? { token, rol, nombre, id } : null;
  });

  const login = (data) => {
    localStorage.setItem('adc_token',  data.token);
    localStorage.setItem('adc_rol',    data.rol);
    localStorage.setItem('adc_nombre', data.nombre ?? '');
    localStorage.setItem('adc_id',     data.id ?? '');
    setAuthUser(data);
  };

  const logout = () => {
    localStorage.removeItem('adc_token');
    localStorage.removeItem('adc_rol');
    localStorage.removeItem('adc_nombre');
    localStorage.removeItem('adc_id');
    setAuthUser(null);
  };

  const authFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {}),
      },
    });
  };

  const isAdmin    = authUser?.rol === 'ADMIN';
  const isServidor = authUser?.rol === 'SERVIDOR';

  return (
    <AuthContext.Provider value={{ authUser, login, logout, authFetch, isAdmin, isServidor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};