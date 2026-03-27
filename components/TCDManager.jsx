import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const path      = 'http://localhost:5000/api';

// ─── Estado vacío ─────────────────────────────────────────────────────────────

function EmptyTCD() {
  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-image text-slate-300 text-3xl"></i>
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-1">Sin registros</h3>
      <p className="text-slate-400 text-sm">No se encontraron registros en este rango de fechas.</p>
    </div>
  );
}

// ─── Uploader ─────────────────────────────────────────────────────────────────

function TCDUploader({ onUpload, currentUser }) {
  const { authFetch } = useAuth();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);         // ← guardamos el File real
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);                             // ← guardamos el File original

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result); // solo para preview
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
  if (!file) return;          // ✅ Validar primero
  setLoading(true);           // ✅ Activar loading antes del fetch
  setError(null);

  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('idPersona', currentUser.id);

    const res = await fetch(`${path}/upload`, {
      method: 'POST',
      // ✅ Sin Content-Type — el navegador lo pone automáticamente con el boundary
      body: formData,
    });

    if (!res.ok) throw new Error('Error al subir la imagen');

    const imageUrl = await res.text();

    onUpload({
      userId:   currentUser.id,
      userName: currentUser.name,
      date:     new Date().toISOString().split('T')[0],
      image:    imageUrl,
    });

    setFile(null);
    setPreview(null);

  } catch (err) {
    setError('No se pudo subir la imagen. Intenta de nuevo.');
  } finally {
    setLoading(false);        // ✅ Siempre se ejecuta
  }
};

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-slate-800">Subir mi TCD de hoy</h2>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <label className="w-full md:w-1/2 block border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors group">
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {preview ? (
            <img src={preview} className="max-h-48 mx-auto rounded-lg" alt="Vista previa TCD" />
          ) : (
            <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">
              <i className="fas fa-cloud-upload-alt text-4xl mb-3 block"></i>
              <p className="text-sm font-medium">Presiona para seleccionar imagen</p>
              <p className="text-xs mt-1 text-slate-300">JPG, PNG, WEBP</p>
            </div>
          )}
        </label>

        <div className="w-full md:w-1/2 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <i className="fas fa-book-open text-indigo-300 mb-2 block"></i>
            <p className="text-sm text-indigo-700 italic">
              prueba Lámpara es a mis pies tu palabra, y lumbrera a mi camino.
            </p>
            <p className="text-xs text-indigo-400 mt-1 font-bold">— Salmos 119:105</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleUpload}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              file && !loading
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Subiendo...
              </>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i>
                Subir TCD
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta TCD ──────────────────────────────────────────────────────────────

function TCDCard({ entry }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
      <div className="relative overflow-hidden rounded-lg mb-2">
        <img
          src={entry.image}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          alt={`TCD de ${entry.userName}`}
        />
      </div>
      <div className="text-sm font-bold text-slate-800">{entry.userName}</div>
      <div className="text-xs text-slate-400 mt-0.5">
        <i className="fas fa-calendar-alt mr-1"></i>{entry.date}
      </div>
    </div>
  );
}

// ─── Filtro de fechas ─────────────────────────────────────────────────────────

function DateRangeFilter({ range, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="date"
        className="p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        value={range.start}
        onChange={e => onChange({ ...range, start: e.target.value })}
      />
      <span className="text-slate-400 text-sm font-medium">hasta</span>
      <input
        type="date"
        className="p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        value={range.end}
        onChange={e => onChange({ ...range, end: e.target.value })}
      />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const TCDManager = ({ tcdEntries, onAddEntry, currentUser }) => {
  const {  authUser } = useAuth();
  const [range, setRange] = useState({ start: '', end: '' });

  const filtered = tcdEntries.filter(entry => {
    if (!range.start || !range.end) return true;
    return entry.date >= range.start && entry.date <= range.end;
  });

  return (
    <div className="space-y-8">
      {/* Le pasamos currentUser al uploader */}
      <TCDUploader onUpload={onAddEntry} currentUser={authUser} />

      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Consultar TCD Diarios</h2>
            {tcdEntries.length > 0 && (
              <p className="text-sm text-slate-400 mt-0.5">{filtered.length} registros encontrados</p>
            )}
          </div>
          <DateRangeFilter range={range} onChange={setRange} />
        </div>

        {filtered.length === 0 ? (
          <EmptyTCD />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map(entry => (
              <TCDCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TCDManager;