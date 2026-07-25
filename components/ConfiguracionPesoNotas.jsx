import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from './useApi.js';
import { useAppStore } from '../store/UseAppStore.jsx';

const KEYS = [
  { key: 'PESO_MAESTRO',   label: 'Maestro',   icon: 'fa-chalkboard-teacher' },
  { key: 'PESO_ASISTENCIA', label: 'Asistencia', icon: 'fa-check-double' },
  { key: 'PESO_PRACTICA',   label: 'Práctica',   icon: 'fa-hands-helping' },
  { key: 'PESO_EXAMEN',     label: 'Examen Final', icon: 'fa-file-alt' },
];

export default function ConfiguracionPesoNotas() {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const pesosNota = useAppStore(s => s.pesosNota);
  const setPesosNota = useAppStore(s => s.setPesosNota);

  const [form, setForm] = useState({ ...pesosNota });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  useEffect(() => { setForm({ ...pesosNota }); }, [pesosNota]);

  const total = Object.values(form).reduce((a, b) => a + (parseFloat(b) || 0), 0);
  const esValido = Math.abs(total - 100) < 0.01;

  const set = (key) => (e) => {
    let val = parseFloat(e.target.value) || 0;
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    setForm(prev => ({ ...prev, [key]: val }));
    setError(null);
    setExito(false);
  };

  const handleSave = async () => {
    if (!esValido) { setError(`La suma de los pesos debe ser 100%. Actual: ${total.toFixed(1)}%`); return; }
    setSaving(true);
    setError(null);
    setExito(false);
    try {
      const res = await authFetch(getUrl('/configuracion/pesos-nota'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Error al guardar');
      }
      setPesosNota({ ...form });
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setForm({ PESO_MAESTRO: 30, PESO_ASISTENCIA: 20, PESO_PRACTICA: 20, PESO_EXAMEN: 30 });
    setError(null);
    setExito(false);
  };

  const getColorBar = (pct) => {
    if (pct >= 30) return 'bg-indigo-500';
    if (pct >= 20) return 'bg-amber-400';
    return 'bg-slate-300';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Configuración</h2>
        <p className="text-slate-400 text-sm mt-1">Ajustes generales del sistema</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <i className="fas fa-balance-scale text-indigo-500"></i> Peso de Notas en Cursos
          </h3>
          <p className="text-xs text-slate-400 mt-1">Define el porcentaje que vale cada componente en la calificación final</p>
        </div>

        <div className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          {exito && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm"><i className="fas fa-check mr-2"></i>Configuración guardada correctamente</div>}

          {/* Barra de total */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</span>
                <span className={`text-lg font-black ${esValido ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {total.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${esValido ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(total, 100)}%` }}
                />
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${esValido ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {esValido ? 'Válido' : 'Inválido'}
            </span>
          </div>

          {/* Inputs de pesos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {KEYS.map(({ key, label, icon }) => (
              <div key={key} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <i className={`fas ${icon} text-indigo-500 text-xs`}></i>
                  </div>
                  <label className="text-sm font-bold text-slate-700">{label}</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-center font-bold"
                    value={form[key]}
                    onChange={set(key)}
                  />
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${getColorBar(form[key])}`}
                    style={{ width: `${Math.min(form[key], 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={resetDefaults}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            <i className="fas fa-undo mr-1"></i> Valores por defecto
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !esValido}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <i className="fas fa-info-circle text-amber-500 mt-0.5"></i>
          <div className="text-xs text-amber-700 space-y-1">
            <p className="font-bold">¿Cómo afecta esta configuración?</p>
            <ul className="list-disc ml-4 space-y-0.5 text-amber-600">
              <li>Los nuevos pesos se aplican al <strong>calcular notas nuevas</strong></li>
              <li>Las notas ya guardadas <strong>no se modifican</strong></li>
              <li>La vista previa del modal de notas usa estos pesos en tiempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
