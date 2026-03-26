import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Importar useAuth para authFetch

const API_BASE = '/api'; // Asegúrate de que esta URL base sea correcta para tu backend

function ServiceSearch() {
  const { authFetch } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedDate) {
      setServices([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Realizar la petición al nuevo endpoint
    authFetch(`${API_BASE}/findprog?date=${selectedDate}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setError('No se pudo cargar la programación: ' + err.message);
      })
      .finally(() => setLoading(false));
  }, [selectedDate, authFetch]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Consultar Servicios</h2>
          <p className="text-slate-500 text-sm">Busca actividades por rango de fechas.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha del Servicio</label>
            <input 
              type="date" 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Cargando servicios...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
            <i className="fas fa-exclamation-triangle text-red-400 text-2xl mb-2"></i>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!selectedDate && !loading && !error ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
            <i className="fas fa-search text-slate-200 text-4xl mb-4"></i>
            <p className="text-slate-400 font-medium">Ingresa un rango para comenzar la búsqueda</p>
          </div> 
        ) : services.length === 0 && !loading && !error ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl">
            <i className="fas fa-calendar-times text-slate-300 text-4xl mb-4"></i>
            <p className="text-slate-500">No se encontraron servicios en estas fechas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">
              {services.length} servicios encontrados para el {selectedDate}
            </p>
            <div className="grid gap-4">
              {services.map(event => (
                <div key={event.id} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex flex-col items-center justify-center font-bold">
                      <span className="text-xs leading-none">{new Date(event.date + 'T00:00:00').getDate()}</span>
                      <span className="text-[8px] uppercase">{new Date(event.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{event.title || 'Servicio General'}</h4> {/* Asumiendo que el evento tiene un título */}
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <i className="far fa-clock"></i> {event.time}
                        <span className="text-slate-200">|</span>
                        <i className="fas fa-user-tie"></i> {event.coordinator?.name || 'Por asignar'}
                      </p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {/* Manejar el nuevo formato de ministries: array de objetos */}
                    {(event.ministries || []).map((minObj, i) => {
                      const ministryName = Object.keys(minObj)[0];
                      return (
                        <div key={ministryName} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                          i % 2 === 0 ? 'bg-indigo-500' : 'bg-emerald-500'
                        }`} title={ministryName}>
                          {ministryName.charAt(0)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceSearch;