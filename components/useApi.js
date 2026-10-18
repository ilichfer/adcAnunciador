// URL base de la API.
// - Producción: '/api' (mismo dominio; Nginx redirige al backend).
// - Desarrollo: definida en .env.development (VITE_API_URL=http://localhost:5000/api).
export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

// Evento que se emite cuando el backend rechaza el token (sesión vencida o inválida).
export const SESSION_EXPIRED_EVENT = 'adc:session-expired';

/**
 * Cliente HTTP único de la app:
 * - agrega el token de sesión (Authorization: Bearer ...) si existe,
 * - pone Content-Type JSON salvo cuando se envía FormData (el navegador pone el boundary),
 * - si el backend responde 401 teniendo sesión, avisa para cerrarla.
 */
export const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem('adc_token');
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, { ...options, headers }).then(res => {
    if (res.status === 401 && token) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return res;
  });
};

export const useApi = () => {
  const getUrl = (endpoint) => {
    if (!endpoint) return API_BASE;
    // Elimina slashes duplicados entre la base y el endpoint
    const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${API_BASE}/${path}`;
  };

  return { getUrl, API_BASE };
};
