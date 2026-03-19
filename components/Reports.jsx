import { useState, useMemo } from 'react';

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

function ReportRow({ item, maxCount }) {
  const pct = maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
  const badge =
    item.count === 0   ? { label: 'Sin registros', cls: 'bg-rose-100 text-rose-600' }
    : item.count >= 5  ? { label: 'Excelente',     cls: 'bg-emerald-100 text-emerald-700' }
    : item.count >= 3  ? { label: 'Regular',        cls: 'bg-amber-100 text-amber-700' }
    :                    { label: 'Bajo',            cls: 'bg-rose-100 text-rose-600' };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group">
      <img src={item.avatar} className="w-10 h-10 rounded-full border border-slate-200 flex-shrink-0" alt={item.name} />
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-800 truncate">{item.name}</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ml-2 flex-shrink-0 ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="text-xs text-slate-400 mb-2">{item.ministry}</div>
        {/* Barra de progreso */}
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-700 group-hover:bg-indigo-600"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-2xl font-black text-indigo-600">{item.count}</div>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">subidas</div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const Reports = ({ users, tcdEntries }) => {
  const [range, setRange] = useState({ start: '', end: '' });

  const reportData = useMemo(() => {
    if (!range.start || !range.end) return null;
    return users
      .map(user => ({
        ...user,
        count: tcdEntries.filter(e =>
          e.userId === user.id &&
          e.date >= range.start &&
          e.date <= range.end
        ).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [users, tcdEntries, range]);

  const maxCount = reportData ? Math.max(...reportData.map(r => r.count), 1) : 1;
  const totalUploads = reportData?.reduce((sum, r) => sum + r.count, 0) ?? 0;

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

          {/* Filtro de rango */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="space-y-0.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desde</label>
              <input
                type="date"
                className="p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={range.start}
                onChange={e => setRange(r => ({ ...r, start: e.target.value }))}
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasta</label>
              <input
                type="date"
                className="p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={range.end}
                onChange={e => setRange(r => ({ ...r, end: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Contenido */}
        {!reportData ? (
          <ReportsPlaceholder />
        ) : reportData.length === 0 ? (
          <ReportsEmpty />
        ) : (
          <div className="space-y-3">
            {reportData.map(item => (
              <ReportRow key={item.id} item={item} maxCount={maxCount} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;