import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from './useApi.js';

const ContactAdmin = () => {
  const { authUser } = useAuth();
  const { getUrl } = useApi();
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const fetchContactos = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = filtro === 'noLeidos' ? '/contacto?soloNoLeidos=true' : '/contacto';
      const res = await fetch(getUrl(endpoint), {
        headers: { 'Authorization': `Bearer ${authUser.token}` }
      });
      if (!res.ok) throw new Error('Error al cargar mensajes');
      const data = await res.json();
      setContactos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authUser, filtro]);

  useEffect(() => {
    fetchContactos();
  }, [fetchContactos]);

  const marcarLeido = async (id) => {
    try {
      const res = await fetch(getUrl(`/contacto/${id}/leer`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${authUser.token}` }
      });
      if (res.ok) {
        setContactos(prev => prev.map(c => c.id === id ? { ...c, leido: true } : c));
      }
    } catch (err) {
      console.error('Error al marcar como leído:', err);
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mensajes de Contacto</h2>
          <p className="text-slate-400 text-sm mt-1">Consulta los mensajes recibidos desde la página web</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFiltro('todos')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filtro === 'todos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>Todos</button>
          <button onClick={() => setFiltro('noLeidos')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filtro === 'noLeidos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>No leídos</button>
          <button onClick={fetchContactos} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"><i className="fas fa-sync-alt mr-2"></i>Recargar</button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm mb-6">{error}</div>
      )}

      {contactos.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-envelope-open text-slate-300 text-3xl"></i>
          </div>
          <p className="text-slate-400 font-medium">No hay mensajes {filtro === 'noLeidos' ? 'sin leer' : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contactos.map(contacto => (
            <div key={contacto.id} className={`bg-white rounded-2xl border p-6 transition-all ${contacto.leido ? 'border-slate-200' : 'border-indigo-200 shadow-md shadow-indigo-50'}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 text-lg">{contacto.nombre}</h3>
                    {!contacto.leido && <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-200">Nuevo</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-3 flex-wrap">
                    <span><i className="fas fa-envelope mr-1.5"></i>{contacto.email}</span>
                    <span><i className="fas fa-clock mr-1.5"></i>{formatearFecha(contacto.fechaCreacion)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asunto:</span>
                    <p className="text-slate-700 font-medium">{contacto.asunto}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mensaje:</span>
                    <p className="text-slate-600 mt-1 whitespace-pre-wrap">{contacto.mensaje}</p>
                  </div>
                </div>
                {!contacto.leido && (
                  <button onClick={() => marcarLeido(contacto.id)} className="shrink-0 px-5 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                    <i className="fas fa-check-circle"></i>
                    <span>Marcar leído</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactAdmin;
