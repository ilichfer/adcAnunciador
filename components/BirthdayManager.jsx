import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Birthday from './Birthday.jsx';
import { useApi } from './useApi.js';

const BirthdayManager = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useAuth();
  const { getUrl } = useApi();

  // Obtener el nombre del mes actual en español
  const currentMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await authFetch(getUrl('/findBirthDaysMOnth'));
        if (response.ok) {
          const data = await response.json();
          setBirthdays(data);
        } else {
          console.error('Error al obtener cumpleaños:', response.statusText);
        }
      } catch (error) {
        console.error('Error de red al obtener cumpleaños:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []); // Se ejecuta solo una vez al montar el componente para evitar múltiples llamados

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-400 text-sm font-medium">Cargando cumpleaños...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 capitalize tracking-tighter">
          Cumpleaños de <span className="text-indigo-600">{currentMonth}</span>
        </h2>
        <div className="h-1.5 w-24 bg-indigo-600 rounded-full mt-2 shadow-sm shadow-indigo-100"></div>
      </div>

      <Birthday birthdays={birthdays} />
    </div>
  );
};

export default BirthdayManager;