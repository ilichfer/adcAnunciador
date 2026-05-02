import { useState, useEffect } from 'react';
import { useApi } from '../components/useApi.js';

// Reports NO necesita datos del store: hace su propio fetch al endpoint
// /api/scheduleByDate con un rango de fechas. Se mantiene igual al original.


// ─── Estado: pide rango ───────────────────────────────────────────────────────

function ReportsPlaceholder() {
  return (
    <div className="text-center py-14 text-slate-400">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-filter text-slate-300 text-2xl"></i>
      </div>
      <p className="font-medium text-slate-500">Selecciona un rango de fechas</p>
      <p className="text-sm mt-1">para generar el reporte de cumplimiento</p>
    </div>
  );
}

// ─── Estado vacío: sin resultados ─────────────────────────────────────────────

function ReportsEmpty() {
  return (
    <div className="text-center py-14 text-slate-400">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-chart-bar text-slate-300 text-2xl"></i>
      </div>
      <p className="font-medium text-slate-500">Sin registros en este período</p>
      <p className="text-sm mt-1">Prueba con un rango de fechas diferente</p>
    </div>
  );
}

// ─── Fila de usuario en reporte ───────────────────────────────────────────────

function ReportRow({ item, maxCount, onShowDetails }) {
  const pct = maxCount > 0 ? Math.round((item.cantidadEntregados / maxCount) * 100) : 0;
  const badge =
    item.cantidadEntregados === 0 ? { label: 'Sin registros', cls: 'bg-rose-100 text-rose-600' }
      : item.cantidadEntregados >= 5 ? { label: 'Excelente', cls: 'bg-emerald-100 text-emerald-700' }
        : item.cantidadEntregados >= 3 ? { label: 'Regular', cls: 'bg-amber-100 text-amber-700' }
          : { label: 'Bajo', cls: 'bg-rose-100 text-rose-600' };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
        <span className="text-indigo-600 font-bold text-sm">
          {item.nombre.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-800 truncate capitalize">{item.nombre}</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ml-2 flex-shrink-0 ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-700 group-hover:bg-indigo-600"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <button 
          onClick={() => onShowDetails(item.idPersona)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all"
        >
          ver mas
        </button>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-2xl font-black text-indigo-600">{item.cantidadEntregados}</div>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">subidas</div>
      </div>
    </div>
  );
}

// ─── Detalle de TCD por persona ──────────────────────────────────────────────

function ReportDetails({ data, userName, onBack }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Registros TCD</h3>
          <p className="text-sm text-slate-400">Usuario: <span className="capitalize font-medium text-slate-600">{userName}</span></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Registro</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visualizar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((record, idx) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{record.fechaCreacion}</td>
                  <td className="px-6 py-4 text-center">
                    {record.urlImage ? (
                      <a 
                        href={record.urlImage} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 transition-colors inline-block"
                        title="Ver imagen TCD"
                      >
                        <i className="fas fa-eye text-base"></i>
                      </a>
                    ) : (
                      <span className="text-slate-300" title="Sin imagen">
                        <i className="fas fa-eye-slash text-base"></i>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const Reports = () => {
  const [range, setRange] = useState({ fechaInicio: '', fechaFin: '' });
  const [reportData, setReportData] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getUrl } = useApi();

  useEffect(() => {
    if (!range.fechaInicio || !range.fechaFin) {
      setReportData(null);
      return;
    }

    let cancelled = false;

    async function fetchReport() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(getUrl(`/scheduleByDate`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(range),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Error al obtener el reporte');
        if (!cancelled) setReportData(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setError(err.message); setReportData(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReport();
    return () => { cancelled = true; };
  }, [range.fechaInicio, range.fechaFin]);

  const maxCount = reportData ? Math.max(...reportData.map(r => r.cantidadEntregados), 1) : 1;
  const totalUploads = reportData?.reduce((sum, r) => sum + r.cantidadEntregados, 0) ?? 0;

  const handleShowDetails = async (idPersona) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(getUrl(`/findTcdPerson?idPersona=${idPersona}&fechaInicio=${range.fechaInicio}&fechaFin=${range.fechaFin}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('No se pudo obtener el detalle');
      const data = await res.json();
      setDetails(Array.isArray(data) ? data : []);
      
      const userItem = reportData.find(r => r.idPersona === idPersona);
      setSelectedUserName(userItem?.nombre || 'Usuario');
    } catch (err) {
      alert(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Reporte de Cumplimiento TCD</h2>
            {reportData && (
              <p className="text-sm text-slate-400 mt-1">
                {reportData.length} usuarios · {totalUploads} imágenes en total
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="space-y-0.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desde</label>
              <input
                type="date"
                className="p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={range.fechaInicio}
                onChange={e => setRange(r => ({ ...r, fechaInicio: e.target.value }))}
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasta</label>
              <input
                type="date"
                className="p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={range.fechaFin}
                onChange={e => setRange(r => ({ ...r, fechaFin: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">
            <i className="fas fa-exclamation-circle mr-2"></i>{error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-14 text-slate-400">
            <i className="fas fa-spinner fa-spin text-2xl mb-3 block text-indigo-400"></i>
            <p className="text-sm">Cargando reporte...</p>
          </div>
        ) : detailsLoading ? (
          <div className="text-center py-14 text-slate-400">
            <i className="fas fa-spinner fa-spin text-2xl mb-3 block text-indigo-400"></i>
            <p className="text-sm">Consultando registros...</p>
          </div>
        ) : details ? (
          <ReportDetails data={details} userName={selectedUserName} onBack={() => setDetails(null)} />
        ) : !reportData ? (
          <ReportsPlaceholder />
        ) : reportData.length === 0 ? (
          <ReportsEmpty />
        ) : (
          <div className="space-y-3">
            {reportData.map(item => (
              <ReportRow 
                key={item.idPersona} 
                item={item} 
                maxCount={maxCount} 
                onShowDetails={handleShowDetails} 
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;