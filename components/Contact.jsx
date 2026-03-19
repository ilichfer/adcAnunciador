
import { useState } from 'react';

const Contact = () => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: 'Consulta General', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulación de envío de API
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', subject: 'Consulta General', message: '' });
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl border border-slate-200 shadow-xl text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Mensaje Enviado!</h2>
        <p className="text-slate-500 mb-8">Gracias por contactarnos. Nuestro equipo administrativo te responderá en la brevedad posible.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Columna de Información */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fas fa-church text-9xl -rotate-12"></i>
          </div>
          <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
          <div className="space-y-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-60">Ubicación</p>
                <p className="text-sm font-medium">Av. Principal de la Fe, Edif. ADC, Ciudad Central</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-60">Línea Directa</p>
                <p className="text-sm font-medium">+57 (300) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-60">Correo Electrónico</p>
                <p className="text-sm font-medium">contacto@adc.com</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-xs font-bold uppercase opacity-60 mb-4">Síguenos</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-2">Horarios de Oficina</h3>
          <div className="space-y-2 text-sm text-slate-500">
            <div className="flex justify-between">
              <span>Lun - Vie:</span>
              <span className="font-semibold text-slate-700">08:00 AM - 05:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Sábados:</span>
              <span className="font-semibold text-slate-700">09:00 AM - 12:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Domingos:</span>
              <span className="text-indigo-600 font-bold">Servicios Especiales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="lg:col-span-2">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm h-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Envíanos un mensaje</h2>
            <p className="text-slate-500">¿Tienes dudas sobre los ministerios o necesitas asistencia pastoral? Escríbenos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tu Nombre</label>
                <input 
                  type="text" required
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input 
                  type="email" required
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})}
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Asunto</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                value={formState.subject} onChange={e => setFormState({...formState, subject: e.target.value})}
              >
                <option>Consulta General</option>
                <option>Asistencia Pastoral</option>
                <option>Información de Ministerios</option>
                <option>Reporte de Error en App</option>
                <option>Otros</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mensaje</label>
              <textarea 
                required
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-40 resize-none"
                value={formState.message} onChange={e => setFormState({...formState, message: e.target.value})}
                placeholder="Escribe aquí tu mensaje detallado..."
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Enviar Mensaje</span>
                  <i className="fas fa-paper-plane text-xs"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
