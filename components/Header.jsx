const Header = ({ onLogout, userName, rol }) => {
  return (
    <header className="bg-white border-b border-slate-200 py-4">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <i className="fas fa-church text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-800 uppercase">ADC</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] opacity-80">Gestión Eclesiástica</p>
          </div>
        </div>

        {onLogout && (
          <div className="flex items-center gap-3">
            {userName && (
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{userName}</span>
                {rol && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase">{rol}</span>}
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden md:inline">Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;