import { useState, useEffect} from 'react';
// 1. Importamos la biblioteca
import Confetti from 'react-confetti';

export default function Birthday({ birthdays }) {
  // Estado para controlar cuándo se muestra el confeti
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Estado para guardar las dimensiones de la ventana
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Función para actualizar las dimensiones si el usuario cambia el tamaño de la ventana
  const detectSize = () => {
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    // Si hay cumpleañeros, activamos el confeti
    if (birthdays.length > 0) {
      setShowConfetti(true);
      
      // Detectar cambio de tamaño de ventana para el canvas del confeti
      window.addEventListener('resize', detectSize);

      // 2. Temporizador para detener el confeti después de 5 segundos
      // (así no consume recursos indefinidamente)
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 6000);

      // Limpieza del efecto
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', detectSize);
      };
    }
  }, [birthdays]); // Se ejecuta cuando cambia la lista de cumpleañeros

  return (
    <>
      {/* 3. Renderizado condicional del Confetti */}
      {showConfetti && birthdays.length > 0 && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={showConfetti} // Deja de generar partículas nuevas cuando el estado cambia a false
          numberOfPieces={200} // Cantidad de papelillos
          gravity={0.15} // Velocidad de caída
          colors={['#3b82f6', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24']} // Colores personalizados (azul, violeta, rosa, amarillo)
        />
      )}

      {birthdays.length > 0 && (
        <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-8 shadow-sm my-6 relative overflow-hidden">
          {/* Un toque decorativo extra de fondo */}
          <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12">🎂</div>
          
          <div className="relative z-10"> {/* Aseguramos que el texto esté sobre la decoración */}
            {/* Encabezado con el mensaje de bendición */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
                ¡Hoy celebramos la vida! 🎉
              </h2>
              <p className="text-lg text-blue-600 font-medium italic">
                "¡Que Dios bendiga tu vida, que veas su favor y su misericordia cada día!"
              </p>
            
            </div>

            {/* Listado de cumpleañeros en Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {birthdays.map((user) => (
                <UserBirthdayCard key={user.id} user={user} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UserBirthdayCard({ user }) {
  const initials = (user.nombre ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      {/* Avatar circular estilizado */}
      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-white shadow-inner group-hover:scale-110 transition-transform">
        {initials}
      </div>

      <div className="ml-4">
        <div className="text-sm text-slate-500 font-medium">Cumpleañer@</div>
        <div className="font-bold text-slate-800 text-lg">
          {user.nombre} {user.apellido}
        </div>
      </div>

      {/* Decoración discreta que aparece al hacer hover */}
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xl">
        ✨
      </div>
    </div>
  );
}