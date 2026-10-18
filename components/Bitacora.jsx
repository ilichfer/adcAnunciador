import { useCallback, useEffect, useState } from 'react';
import { useApi, apiFetch } from './useApi.js';

const NOMBRES = {
  CAMBIO_ROL: 'Cambio de rol',
  CAMBIO_ESTADO_USUARIO: 'Activar / desactivar usuario',
  REGISTRO_PERSONA: 'Registro de persona',
  CAMBIO_CONTRASENA: 'Cambio de contraseña',
  PROGRAMACION: 'Programación',
  COORDINADOR: 'Coordinador',
  CONFIRMACION_TURNO: 'Confirmación de turno',
  MINISTERIO: 'Ministerios',
  NOTA: 'Notas',
  CURSO: 'Cursos',
  CONFIGURACION: 'Configuración',
  IMAGEN_MES: 'Imagen del mes',
  WHATSAPP: 'WhatsApp',
};

const ICONOS = {
  CAMBIO_ROL: 'fa-user-shield', CAMBIO_ESTADO_USUARIO: 'fa-user-slash', REGISTRO_PERSONA: 'fa-user-plus',
  CAMBIO_CONTRASENA: 'fa-key', PROGRAMACION: 'fa-calendar-alt', COORDINADOR: 'fa-user-tie',
  CONFIRMACION_TURNO: 'fa-calendar-check', MINISTERIO: 'fa-sitemap', NOTA: 'fa-pen-to-square',
  CURSO: 'fa-graduation-cap', CONFIGURACION: 'fa-cog', IMAGEN_MES: 'fa-image', WHATSAPP: 'fa-brands fa-whatsapp',
};

const isoHace = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Bitacora() {
  const { getUrl } = useApi();
  const [filtros, setFiltros] = useState({ desde: isoHace(30), hasta: isoHace(0), accion: '', texto: '' });
  const [textoEscrito, setTextoEscrito] = useState('');
  const [pagina, setPagina] = useState(0);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    const q = new URLSearchParams({ desde: filtros.desde, hasta: filtros.hasta, pagina, tamano: 50 });
    if (filtros.accion) q.set('accion', filtros.accion);
    if (filtros.texto) q.set('texto', filtros.texto);
    apiFetch(getUrl(`/auditoria?${q}`))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('No se pudo cargar la bitácora'))))
      .then(setDatos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [filtros, pagina]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargar(); }, [cargar]);

  // Búsqueda por texto con una pequeña espera para no consultar en cada tecla
  useEffect(() => {
    const t = setTimeout(() => {
      setPagina(0);
      setFiltros((f) => (f.texto === textoEscrito ? f : { ...f, texto: textoEscrito }));
    }, 400);
    return () => clearTimeout(t);
  }, [textoEscrito]);

  const cambiar = (campo) => (e) => {
    setPagina(0);
    setFiltros((f) => ({ ...f, [campo]: e.target.value }));
  };

  const control = 'h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-clipboard-list text-indigo-500" aria-hidden="true"></i>Bitácora de cambios
        </h2>
        <p className="text-sm text-slate-500 mt-1">Quién cambió roles, programación, notas y demás, y cuándo.</p>

        <div className="flex flex-wrap gap-3 mt-5">
          <label className="text-xs font-bold text-slate-500 uppercase">Desde
            <input type="date" value={filtros.desde} onChange={cambiar('desde')} className={`${control} block mt-1`} />
          </label>
          <label className="text-xs font-bold text-slate-500 uppercase">Hasta
            <input type="date" value={filtros.hasta} onChange={cambiar('hasta')} className={`${control} block mt-1`} />
          </label>
          <label className="text-xs font-bold text-slate-500 uppercase">Tipo
            <select value={filtros.accion} onChange={cambiar('accion')} className={`${control} block mt-1`}>
              <option value="">Todos</option>
              {Object.entries(NOMBRES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-500 uppercase flex-1 min-w-[200px]">Buscar
            <input type="search" value={textoEscrito} onChange={(e) => setTextoEscrito(e.target.value)}
              placeholder="Nombre o descripción" className={`${control} block mt-1 w-full normal-case font-normal`} />
          </label>
        </div>
      </div>

      {error && <p className="text-rose-600 text-sm">{error}</p>}

      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${cargando ? 'opacity-60' : ''}`}>
        {datos?.registros?.length === 0 && (
          <p className="p-10 text-center text-slate-400">No hay cambios registrados con estos filtros.</p>
        )}
        <ul className="divide-y divide-slate-100">
          {datos?.registros?.map((r) => (
            <li key={r.id} className="p-4 flex gap-4">
              <span className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <i className={`${ICONOS[r.accion]?.startsWith('fa-brands') ? ICONOS[r.accion] : `fas ${ICONOS[r.accion] || 'fa-circle-info'}`}`} aria-hidden="true"></i>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-bold text-slate-800">{r.usuario || '—'}</span>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{NOMBRES[r.accion] || r.accion}</span>
                  <time className="text-xs text-slate-400">
                    {new Date(r.fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                  </time>
                </div>
                <p className="text-sm text-slate-600 mt-1 break-words">{r.descripcion}</p>
              </div>
            </li>
          ))}
        </ul>
        {datos && datos.paginas > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 text-sm">
            <span className="text-slate-500">{datos.total} registros · página {datos.pagina + 1} de {datos.paginas}</span>
            <div className="flex gap-2">
              <button disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}
                className="px-4 h-9 rounded-xl border border-slate-200 font-semibold disabled:opacity-40">Anterior</button>
              <button disabled={pagina + 1 >= datos.paginas} onClick={() => setPagina((p) => p + 1)}
                className="px-4 h-9 rounded-xl border border-slate-200 font-semibold disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
