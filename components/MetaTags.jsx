import { useEffect } from 'react';

/**
 * Componente para manejar metadatos dinámicos sin librerías externas.
 */
export default function MetaTags({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Anunciadores de Cristo`;
    }
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}