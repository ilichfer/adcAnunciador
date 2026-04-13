import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../components/useApi.js';

const CoordinatorReport = () => {
  const { authFetch, authUser } = useAuth();
  const { getUrl } = useApi();
  const today = new Date().toISOString().split('T')[0];
  
  const [form, setForm] = useState({
    fechaString: today,
    notasServicio: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      fechaString: form.fechaString,
      notasServicio: form.notasServicio,
      persona: {
        id: Number(authUser?.id)
      }
    };

    try {
      const res = await authFetch(getUrl('/saveInformCoordinator'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al guardar el informe');
      }

      setSuccess(true);
      setForm({ ...form, notasServicio: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <i className="fas fa-clipboard-list text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Informe de Coordinación</h2>
            <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">Reporte diario de actividades</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
            <i className="fas fa-exclamation-circle text-red-400"></i>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl mb-6">
            <i className="fas fa-check-circle text-emerald-400"></i>
            <span className="text-sm font-medium">Informe guardado con éxito.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha del Servicio</label>
            <input 
              type="date"
              required
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={form.fechaString}
              onChange={(e) => setForm({ ...form, fechaString: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Detalle del Informe</label>
            <textarea
              required
              placeholder="Describe las novedades, asistencias y puntos relevantes del servicio..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-48 resize-none"
              value={form.notasServicio}
              onChange={(e) => setForm({ ...form, notasServicio: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.notasServicio}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            Guardar Informe
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoordinatorReport;