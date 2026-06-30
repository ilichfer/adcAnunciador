import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from './useApi.js';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MonthlyImageManager = () => {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();

  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());

  const fetchCurrentImage = () => {
    setLoading(true);
    authFetch(getUrl('/imagen-mensual/tcd'))
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setCurrentImage(data);
          setMes(data.mes);
          setAnio(data.anio);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCurrentImage();
  }, []);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Selecciona una imagen primero');
      setMessageType('error');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mes', mes);
      formData.append('anio', anio);

      const res = await authFetch(getUrl('/imagen-mensual/upload'), {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentImage(data);
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setMessage('Imagen del mes actualizada correctamente');
        setMessageType('success');
      } else {
        const text = await res.text();
        setMessage(text || 'Error al subir la imagen');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Error de conexión');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          <i className="fas fa-image text-indigo-500 mr-2"></i>
          Imagen del Mes
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Sube la imagen del reporte TCD mensual que se muestra en la landing page pública
        </p>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-slate-200 rounded-xl" />
            <div className="h-10 bg-slate-200 rounded-lg w-2/3" />
          </div>
        ) : (
          <>
            {currentImage && (
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Imagen actual ({MESES[currentImage.mes - 1]} {currentImage.anio})
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={currentImage.url}
                    alt="Reporte actual"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Nueva imagen del mes
                </label>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <label className="w-full md:w-1/2 block border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFile}
                    />
                    {preview ? (
                      <img src={preview} className="max-h-48 mx-auto rounded-lg" alt="Vista previa" />
                    ) : (
                      <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">
                        <i className="fas fa-cloud-upload-alt text-4xl mb-3 block"></i>
                        <p className="text-sm font-medium">Presiona para seleccionar imagen</p>
                        <p className="text-xs mt-1 text-slate-300">JPG, PNG, WEBP</p>
                      </div>
                    )}
                  </label>

                  <div className="w-full md:w-1/2 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Mes
                      </label>
                      <select
                        value={mes}
                        onChange={e => setMes(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm bg-white"
                      >
                        {MESES.map((nombre, idx) => (
                          <option key={idx + 1} value={idx + 1}>{nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Año
                      </label>
                      <input
                        type="number"
                        value={anio}
                        onChange={e => setAnio(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={saving || !file}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
              >
                {saving ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Subiendo imagen...</>
                ) : (
                  <><i className="fas fa-upload mr-2"></i>Subir Imagen del Mes</>
                )}
              </button>

              {message && (
                <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  messageType === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                  {message}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {currentImage && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-3">
            <i className="fas fa-eye text-indigo-500 mr-2"></i>
            Vista previa
          </h3>
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <img
              src={currentImage.url}
              alt="Vista previa"
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {MESES[currentImage.mes - 1]} {currentImage.anio}
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyImageManager;
