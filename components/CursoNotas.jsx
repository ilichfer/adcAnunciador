import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../components/useApi.js';
import { useAppStore } from '../store/UseAppStore.jsx';

const colorBg = (colorCelda) => {
  if (colorCelda === 1) return 'bg-emerald-50 border-emerald-200';
  if (colorCelda === 2) return 'bg-rose-50 border-rose-200';
  if (colorCelda === 3) return 'bg-amber-50 border-amber-200';
  return 'bg-slate-50 border-slate-200';
};

const colorText = (colorCelda) => {
  if (colorCelda === 1) return 'text-emerald-700';
  if (colorCelda === 2) return 'text-rose-700';
  if (colorCelda === 3) return 'text-amber-700';
  return 'text-slate-500';
};

function NotaModal({ estudiante, onClose, onSave }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const pesosNota = useAppStore(s => s.pesosNota);
  const [form, setForm] = useState({
    notaMaestro: estudiante.notaMaestro || 0,
    notaAsistencia: estudiante.notaAsistencia || 0,
    notaPractica: estudiante.notaPractica || 0,
    notaExamenFinal: estudiante.notaExamenFinal || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const pesoM = (pesosNota.PESO_MAESTRO || 30) / 100;
  const pesoA = (pesosNota.PESO_ASISTENCIA || 20) / 100;
  const pesoP = (pesosNota.PESO_PRACTICA || 20) / 100;
  const pesoE = (pesosNota.PESO_EXAMEN || 30) / 100;
  const notaFinal = (form.notaMaestro * pesoM + form.notaAsistencia * pesoA + form.notaPractica * pesoP + form.notaExamenFinal * pesoE).toFixed(2);

  const set = (key) => (e) => {
    let val = parseFloat(e.target.value) || 0;
    if (val > 5) val = 5;
    if (val < 0) val = 0;
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await authFetch(getUrl(`/cursos/${estudiante.cursoId}/notas`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPersona: estudiante.id, ...form })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Error al guardar');
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-center";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest text-center";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Notas de {estudiante.nombre} {estudiante.apellido}</h3>
            <p className="text-xs text-slate-400">Escala: 0.0 a 5.0</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Maestro ({pesosNota.PESO_MAESTRO || 30}%)</label>
              <input type="number" step="0.1" min="0" max="5" className={inputClass} value={form.notaMaestro} onChange={set('notaMaestro')} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Asistencia ({pesosNota.PESO_ASISTENCIA || 20}%)</label>
              <input type="number" step="0.1" min="0" max="5" className={inputClass} value={form.notaAsistencia} onChange={set('notaAsistencia')} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Practica ({pesosNota.PESO_PRACTICA || 20}%)</label>
              <input type="number" step="0.1" min="0" max="5" className={inputClass} value={form.notaPractica} onChange={set('notaPractica')} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Examen Final ({pesosNota.PESO_EXAMEN || 30}%)</label>
              <input type="number" step="0.1" min="0" max="5" className={inputClass} value={form.notaExamenFinal} onChange={set('notaExamenFinal')} />
            </div>
          </div>

          <div className={`p-3 rounded-xl text-center border ${colorBg(parseFloat(notaFinal) >= 4.7 ? 1 : parseFloat(notaFinal) < 3 ? 2 : 3)}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nota Final</p>
            <p className={`text-2xl font-black ${colorText(parseFloat(notaFinal) >= 4.7 ? 1 : parseFloat(notaFinal) < 3 ? 2 : 3)}`}>
              {notaFinal}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CursoNotas({ cursoId }) {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();
  const pesosNota = useAppStore(s => s.pesosNota);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const fetchNotas = async () => {
    setLoading(true);
    try {
      const res = await authFetch(getUrl(`/cursos/${cursoId}/notas`));
      if (res.ok) setNotas(await res.json());
      else setNotas([]);
    } catch (err) { console.error(err); setNotas([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotas(); }, [cursoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-slate-400 text-sm">Cargando notas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h4 className="text-sm font-bold text-slate-700">Notas del Curso ({notas.length} estudiantes)</h4>
        </div>
        {notas.length === 0 ? (
          <div className="p-10 text-center">
            <i className="fas fa-clipboard-list text-slate-200 text-4xl mb-3"></i>
            <p className="text-slate-400 text-sm">No hay notas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3 text-left">Estudiante</th>
                  <th className="px-3 py-3 text-center">Maestro<br/><span className="font-normal normal-case">({pesosNota.PESO_MAESTRO || 30}%)</span></th>
                  <th className="px-3 py-3 text-center">Asistencia<br/><span className="font-normal normal-case">({pesosNota.PESO_ASISTENCIA || 20}%)</span></th>
                  <th className="px-3 py-3 text-center">Practica<br/><span className="font-normal normal-case">({pesosNota.PESO_PRACTICA || 20}%)</span></th>
                  <th className="px-3 py-3 text-center">Examen<br/><span className="font-normal normal-case">({pesosNota.PESO_EXAMEN || 30}%)</span></th>
                  <th className="px-3 py-3 text-center">Final</th>
                  <th className="px-3 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notas.map(n => (
                  <tr key={n.id} className={`${n.colorCelda ? colorBg(n.colorCelda) : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {n.nombre?.[0]}{n.apellido?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{n.nombre} {n.apellido}</p>
                          <p className="text-[10px] text-slate-400">Doc: {n.documento}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-slate-700">{n.notas?.notaMaestro ?? 0}</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-700">{n.notas?.notaAsistencia ?? 0}</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-700">{n.notas?.notaPractica ?? 0}</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-700">{n.notas?.notaExamenFinal ?? 0}</td>
                    <td className={`px-3 py-3 text-center font-black ${n.colorCelda ? colorText(n.colorCelda) : 'text-slate-500'}`}>
                      {n.notas?.notaFinal?.toFixed(2) ?? '0.00'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => setEditing({
                          id: n.id,
                          nombre: n.nombre,
                          apellido: n.apellido,
                          documento: n.documento,
                          cursoId: cursoId,
                          notaMaestro: n.notas?.notaMaestro ?? 0,
                          notaAsistencia: n.notas?.notaAsistencia ?? 0,
                          notaPractica: n.notas?.notaPractica ?? 0,
                          notaExamenFinal: n.notas?.notaExamenFinal ?? 0,
                        })}
                        className="px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <i className="fas fa-pen mr-1"></i> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <NotaModal
          estudiante={editing}
          onClose={() => setEditing(null)}
          onSave={() => { setEditing(null); fetchNotas(); }}
        />
      )}
    </div>
  );
}
