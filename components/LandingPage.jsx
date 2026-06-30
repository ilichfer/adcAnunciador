import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from './useApi.js';


// ─── Servicio de imágenes ─────────────────────────────────────────────────────
//
// Las fotos TCD se almacenan en tu backend. Para mostrarlas en la landing
// sin que se descarguen directo desde el servidor, tienes tres opciones:
//
//  OPCIÓN A — Cloudflare Images (recomendada, gratis hasta 100k imágenes/mes)
//    1. Crea cuenta en dash.cloudflare.com → Images
//    2. Sube las imágenes o activa "Direct Creator Upload" desde tu API
//    3. La URL pública queda: https://imagedelivery.net/<accountHash>/<imageId>/public
//    4. Puedes agregar variantes: /thumbnail (200x200), /card (800x600), etc.
//    Ventaja: CDN global, transformaciones on-the-fly, sin costo de egreso.
//
//  OPCIÓN B — Cloudinary (gratis 25GB almacenamiento / 25GB ancho de banda/mes)
//    URL: https://res.cloudinary.com/<cloud_name>/image/upload/w_400,q_auto,f_auto/<public_id>
//    Con transformaciones inline: redimensiona, comprime y convierte a WebP automático.
//
//  OPCIÓN C — imgix + cualquier bucket S3/R2 (gratis 1000 req/día)
//    URL: https://<subdominio>.imgix.net/<ruta>?w=400&auto=format&q=75
//
// En todos los casos el frontend recibe UNA URL ya optimizada: no descarga
// el original de tu servidor, sino la versión comprimida del CDN.
//
// Por ahora el fetch trae las URLs directamente del endpoint existente.
// Cuando integres un CDN, solo cambia la función `buildImageUrl` abajo.

function TCDGallery({ isVisible, imageUrl, loading, error, mes, anio }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mx-auto max-w-3xl">
          <div className="h-[500px] bg-slate-200 rounded-3xl border-8 border-white shadow-2xl" />
        </div>
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-44 bg-slate-200 rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-image text-slate-300 text-3xl"></i>
        </div>
        <p className="text-slate-400 font-medium">Reporte del mes no disponible</p>
        <p className="text-slate-300 text-sm mt-1">Pronto estará disponible</p>
      </div>
    );
  }

  const handleMouseDown = (e) => {
    if (scale === 1) return;
    setIsDragging(true);
    setStartPan({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = (delta) => {
    setScale((prev) => {
      const newScale = Math.min(Math.max(1, prev + delta), 4);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  return (
    <div className="animate-in fade-in zoom-in duration-700">
      <div 
        className={`relative inline-block overflow-hidden rounded-3xl border-8 border-white shadow-2xl bg-slate-50 ${scale > 1 ? 'cursor-move' : 'cursor-default'}`}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt={`Reporte TCD Mensual - ${mes}/${anio}`}
          className="max-w-full h-auto block select-none pointer-events-none transition-transform duration-200 ease-out origin-center"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />

        <div 
          className="absolute inset-0 z-10"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onContextMenu={(e) => e.preventDefault()}
        ></div>

        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
          <button 
            onClick={() => handleZoom(0.5)}
            className="w-10 h-10 bg-white/90 backdrop-blur border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Acercar"
          >
            <i className="fas fa-search-plus"></i>
          </button>
          <button 
            onClick={() => handleZoom(-0.5)}
            className="w-10 h-10 bg-white/90 backdrop-blur border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Alejar"
          >
            <i className="fas fa-search-minus"></i>
          </button>
          <button 
            onClick={() => { setScale(1); setPosition({x:0, y:0}); }}
            className="w-10 h-10 bg-white/90 backdrop-blur border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            title="Restablecer"
          >
            <i className="fas fa-compress-arrows-alt"></i>
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
          <i className="fas fa-shield-alt mr-2"></i>Contenido Protegido
        </span>
        <p className="text-slate-400 text-[10px] font-bold uppercase">La descarga de este reporte está restringida</p>
      </div>
    </div>
  );
}

const LandingPage = ({ onLoginClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTcdReport, setShowTcdReport] = useState(false);
  const [tcdImageUrl, setTcdImageUrl] = useState(null);
  const [tcdLoading, setTcdLoading] = useState(true);
  const [tcdError, setTcdError] = useState(false);
  const [tcdMes, setTcdMes] = useState(null);
  const [tcdAnio, setTcdAnio] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/imagen-mensual/tcd`)
      .then(r => { if (!r.ok) throw new Error('No disponible'); return r.json(); })
      .then(data => {
        setTcdImageUrl(data.url);
        setTcdMes(data.mes);
        setTcdAnio(data.anio);
        setTcdError(false);
      })
      .catch(() => setTcdError(true))
      .finally(() => setTcdLoading(false));
  }, []);

  const slides = [
    { url: '/img/unidos.jpeg' },
    { url: '/img/oracion_matutina.jpeg' },
    { url: '/img/oracion_ayuno.jpeg' },
    { url: '/img/24_horas.jpeg' },
    { url: '/img/estacion_generocidad.jpeg' },
    { url: '/img/noches_adoracion.jpeg' },
    { url: '/img/reunion_familiar.jpeg' },
    { url: '/img/nuestras_reuniones.jpeg'},
  ];

  // Auto-carrusel cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const navLinks = [
    { label: 'Inicio',    href: '#inicio' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'TCD del Mes', href: '#tcd' },
    { label: 'Videos',    href: '#videos' },
    { label: 'Eventos',   href: '#eventos' },
    { label: 'Contacto',  href: '#contacto' },
  ];

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800" id="inicio">
      
      {/* --- Navbar Público --- */}
      <nav className="bg-slate-900 text-white sticky top-0 z-[100] shadow-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-church text-sm"></i>
            </div>
            <span className="font-black text-lg tracking-tighter uppercase">Anunciadores de Cristo</span>
          </div>
          
          {/* Botón Hamburguesa para Móvil */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
            <button 
              onClick={onLoginClick}
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              LogIn
            </button>
          </div>
        </div>
      </nav>

      {/* --- Menú Dropdown Móvil --- */}
      <div className={`md:hidden bg-slate-900 border-t border-slate-800 transition-all duration-300 ease-in-out overflow-hidden sticky top-16 z-[90] ${
        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 py-6 flex flex-col gap-4">
          {navLinks.map(link => (
            <a 
              key={link.label} 
              href={link.href} 
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-bold text-slate-300 hover:text-white border-b border-white/5 pb-2"
            >
              {link.label}
            </a>
          ))}
          <button 
            onClick={() => { onLoginClick(); setIsMenuOpen(false); }}
            className="bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-white"
          >
            LogIn
          </button>
        </div>
      </div>

      {/* --- Carrusel / Hero --- */}
      <div className="relative aspect-video w-full overflow-hidden group">
        {slides.map((slide, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img src={slide.url} className="w-full h-full object-cover" alt={slide.title} />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-4">
              <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg text-center">{slide.title}</h2>
              <p className="text-lg md:text-xl font-medium drop-shadow-md text-center">{slide.desc}</p>
            </div>
          </div>
        ))}
        
        {/* Controles Carrusel */}
        <button 
          onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white opacity-0 group-hover:opacity-100 transition-all"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button 
          onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white opacity-0 group-hover:opacity-100 transition-all"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* --- Sección Servicios --- */}
      <section id="servicios" className="py-20 max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Nuestros Servicios</h2>
        <div className="w-16 h-1.5 bg-indigo-600 mx-auto mb-6 rounded-full" />
        <p className="text-slate-500 mb-12 max-w-2xl mx-auto font-medium">Únete a nuestras reuniones y experiencias espirituales.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-sun text-2xl"></i>
            </div>
            <h4 className="text-xl font-bold mb-2">Reunión Dominical</h4>
            <p className="text-indigo-600 font-black uppercase text-sm tracking-widest">Domingos — 10:00 AM</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-pray text-2xl"></i>
            </div>
            <h4 className="text-xl font-bold mb-2">Reunión de Oración y Alabanza</h4>
            <p className="text-emerald-600 font-black uppercase text-sm tracking-widest">Viernes — 7:00 PM</p>
          </div>
        </div>
      </section>


      {/* --- Sección TCD del Mes --- */}
      <section id="tcd" className="py-20 max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">TCD del Mes</h2>
        <div className="w-16 h-1.5 bg-indigo-600 mx-auto mb-4 rounded-full" />
        <p className="text-slate-500 mb-8 max-w-2xl mx-auto font-medium">
          El Tiempo Con Dios de nuestra congregación. Cada imagen refleja el compromiso diario de nuestros servidores.
        </p>

        <button 
          onClick={() => setShowTcdReport(!showTcdReport)}
          className="mb-12 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
        >
          {showTcdReport ? 'Ocultar TCD' : 'Ver TCD Mensual'}
        </button>

        <TCDGallery isVisible={showTcdReport} imageUrl={tcdImageUrl} loading={tcdLoading} error={tcdError} mes={tcdMes} anio={tcdAnio} />
      </section>

      {/* --- Sección Videos --- */}
      <section id="videos" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Videos Destacados</h2>
          <div className="w-16 h-1.5 bg-rose-600 mx-auto mb-12 rounded-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              "https://www.youtube.com/embed/Q1I2YKVahI0",
              "https://www.youtube.com/embed/E0WWa1g6TIY",
              "https://www.youtube.com/embed/ehmOQBheuEo"
            ].map((url, idx) => (
              <div key={idx} className="aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <iframe 
                  src={url}
                  className="w-full h-full"
                  title={`Video ${idx}`}
                  allowFullScreen 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Sección Eventos --- */}
      <section id="eventos" className="py-20 max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Próximos Eventos</h2>
        <div className="w-16 h-1.5 bg-amber-500 mx-auto mb-6 rounded-full" />
        <p className="text-slate-500 mb-12 font-medium">Descubre lo que Dios tiene preparado para ti.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-3xl text-left hover:border-amber-500 transition-colors shadow-sm">
            <div className="bg-amber-100 text-amber-600 w-20 h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black">25</span>
              <span className="text-[10px] font-bold uppercase">ABR</span>
            </div>
            <div>
              <h4 className="font-bold text-xl">Dia de los niños</h4>
              <p className="text-slate-400 text-sm">8:00 a 10:00 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-3xl text-left hover:border-amber-500 transition-colors shadow-sm">
            <div className="bg-amber-100 text-amber-600 w-20 h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black">18</span>
              <span className="text-[10px] font-bold uppercase">MAy</span>
            </div>
            <div>
              <h4 className="font-bold text-xl">4to festival misionero</h4>
              <p className="text-slate-400 text-sm">ADC Central — Misiones.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Sección Contacto --- */}
      <section id="contacto" className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Formulario */}
            <div className="text-left space-y-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">Contacto</h2>
                <p className="text-slate-400 mt-2">¡Nos encantaría conocerte! Escríbenos.</p>
              </div>
              
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Tu Nombre" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500" />
                  <input type="email" placeholder="Tu Correo" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500" />
                </div>
                <textarea rows="4" placeholder="Tu Mensaje" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 resize-none"></textarea>
                <button className="bg-indigo-600 hover:bg-indigo-700 px-10 py-4 rounded-2xl font-black uppercase tracking-widest w-full md:w-auto transition-all">
                  Enviar Mensaje
                </button>
              </form>
            </div>

            {/* Mapa */}
            <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] border-4 border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.1102516141086!2d-74.09897119046833!3d4.574210942724055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f98e9172029a9%3A0x2ab065ee2c7bcfbe!2sIglesia%20Cristiana%20Anunciadores%20de%20Cristo!5e0!3m2!1ses!2sco!4v1739454659848!5m2!1ses!2sco"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-black text-white py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <p className="font-black uppercase tracking-widest text-sm">Anunciadores de Cristo</p>
            <p className="text-slate-500 text-xs mt-1">© 2026 Todos los derechos reservados.</p>
          </div>
          
          <div className="flex gap-4">
            <a 
              href="https://www.facebook.com/IgAnunciadoresCristo" 
              target="_blank" 
              rel="noreferrer"
              className="w-12 h-12 bg-white/5 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-all group"
            >
              <i className="fab fa-facebook-f group-hover:scale-110"></i>
            </a>
            <a 
              href="https://www.instagram.com/anunciadores.de.cristo" 
              target="_blank" 
              rel="noreferrer"
              className="w-12 h-12 bg-white/5 hover:bg-rose-600 rounded-full flex items-center justify-center transition-all group"
            >
              <i className="fab fa-instagram group-hover:scale-110"></i>
            </a>
            <a 
              href="https://www.youtube.com/@iganunciadorescristocentral" 
              target="_blank" 
              rel="noreferrer"
              className="w-12 h-12 bg-white/5 hover:bg-rose-700 rounded-full flex items-center justify-center transition-all group"
            >
              <i className="fab fa-youtube group-hover:scale-110"></i>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;