import { useState } from 'react';
import RegisterPersonaModal from './RegisterPersonaModal.jsx';

const PublicRegisterPage = ({ onBack, onLogin }) => {
  const [registered, setRegistered] = useState(false);

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check-circle text-emerald-500 text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Registro exitoso!</h2>
          <p className="text-slate-500 text-sm mb-8">
            Tu cuenta fue creada. Ya puedes iniciar sesión con tu documento y contraseña.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onLogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
            >
              Iniciar sesión
            </button>
            <button
              onClick={onBack}
              className="w-full text-slate-500 font-bold py-2 hover:text-slate-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <span className="font-black text-xl tracking-tighter text-indigo-600 uppercase">ADC</span>
          <button
            onClick={onBack}
            className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Volver al inicio
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800">Crea tu cuenta</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            Regístrate para acceder a tu perfil, tu TCD y tus datos en la iglesia.
          </p>
        </div>
        <RegisterPersonaModal publicMode onSuccess={() => setRegistered(true)} />
      </main>
    </div>
  );
};

export default PublicRegisterPage;
