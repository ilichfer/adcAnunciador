import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from './useApi.js';
import { ServiceView, Empty } from './service-search/ServiceView.jsx';

function ServiceSearch() {
  const { authFetch }  = useAuth();
  const { getUrl } = useApi();
  const [selectedDate, setSelectedDate] = useState('');
  const [service,      setService]      = useState(null);
  const [notFound,     setNotFound]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const fetchService = (date) => {
    if (!date) return;
    setLoading(true);
    setService(null);
    setNotFound(false);
    setError(null);

    authFetch(getUrl(`/findprog?date=${date}`))
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!data) return;
        data.ministries?.length > 0 ? setService(data) : setNotFound(true);
      })
      .catch(() => setError('No se encontro programación para esta fecha: '))
      .finally(() => setLoading(false));
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchService(date);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">

        {/* Encabezado + selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Consultar Servicios</h2>
            <p className="text-slate-500 text-sm mt-1">Selecciona una fecha para ver y editar la programación.</p>
          </div>
          <div className="space-y-1 w-full md:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Fecha del Servicio
            </label>
            <input
              type="date"
              className="w-full md:w-56 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
        </div>

        {!selectedDate && (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
            <i className="fas fa-search text-slate-200 text-4xl mb-4 block"></i>
            <p className="text-slate-400 font-medium">Selecciona una fecha para comenzar</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Cargando programación...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-red-400 text-xl flex-shrink-0"></i>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {notFound && !loading && !error && <Empty date={selectedDate} />}

        {service && !loading && !error && (
          <ServiceView
            data={service}
            date={selectedDate}
            onRefresh={() => fetchService(selectedDate)}
          />
        )}
      </div>
    </div>
  );
}

export default ServiceSearch;
