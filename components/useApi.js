export const API_BASE = 'https://anunciaig.com/api';

export const useApi = () => {
  const getUrl = (endpoint) => {
    if (!endpoint) return API_BASE;
    // Elimina slashes duplicados entre la base y el endpoint
    const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${API_BASE}/${path}`;
  };

  return { getUrl, API_BASE };
};