import { useState } from 'react';

// Color de la serie (validado: contraste >= 3:1 sobre el fondo blanco)
const SERIE = '#2a78d6';

/**
 * Gráfico de columnas de una sola serie (sin leyenda: el título nombra la serie).
 * datos: [{ etiqueta, clave, valor }]
 */
export default function GraficoColumnas({ titulo, descripcion, datos, formato = (v) => String(v), maximo }) {
  const [activo, setActivo] = useState(null);
  const [verTabla, setVerTabla] = useState(false);
  const tope = Math.max(maximo ?? 0, ...datos.map((d) => d.valor), 1);
  const alto = 160;

  return (
    <figure className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <figcaption className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-800">{titulo}</h3>
          {descripcion && <p className="text-xs text-slate-500 mt-0.5">{descripcion}</p>}
        </div>
        <button onClick={() => setVerTabla((v) => !v)} className="text-xs font-semibold text-slate-500 hover:text-slate-800 whitespace-nowrap">
          <i className={`fas ${verTabla ? 'fa-chart-column' : 'fa-table'} mr-1`} aria-hidden="true"></i>
          {verTabla ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      </figcaption>

      {verTabla ? (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b border-slate-100"><th className="py-1.5 font-semibold">Periodo</th><th className="py-1.5 font-semibold text-right">Valor</th></tr></thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.clave} className="border-b border-slate-50"><td className="py-1.5 text-slate-700">{d.etiqueta}</td><td className="py-1.5 text-right font-semibold text-slate-800">{formato(d.valor)}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative" role="img" aria-label={`${titulo}: ${datos.map((d) => `${d.etiqueta} ${formato(d.valor)}`).join(', ')}`}>
          <div className="flex items-end gap-[2px] border-b border-slate-200" style={{ height: alto + 22 }}>
            {datos.map((d, i) => {
              const h = Math.round((d.valor / tope) * alto);
              return (
                <div key={d.clave} className="flex-1 h-full flex flex-col justify-end items-center relative"
                  onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}
                  onFocus={() => setActivo(i)} onBlur={() => setActivo(null)} tabIndex={0}>
                  <span className="text-[11px] font-semibold text-slate-600 mb-1 tabular-nums">{formato(d.valor)}</span>
                  <div className="w-full max-w-[24px] rounded-t-[4px] transition-opacity"
                    style={{ height: Math.max(h, d.valor > 0 ? 2 : 0), background: SERIE, opacity: activo === null || activo === i ? 1 : 0.45 }} />
                  {activo === i && (
                    <div className="absolute bottom-full mb-1 z-10 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap shadow-lg pointer-events-none">
                      <span className="font-semibold">{d.etiqueta}</span>: {formato(d.valor)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-[2px] mt-1.5">
            {datos.map((d) => (
              <span key={d.clave} className="flex-1 text-center text-[10px] text-slate-500 truncate">{d.etiqueta}</span>
            ))}
          </div>
        </div>
      )}
    </figure>
  );
}
