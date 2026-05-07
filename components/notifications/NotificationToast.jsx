import { useState, useEffect } from 'react';

export default function NotificationToast({ notification, onClose, duration = 5000 }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!notification) return null;

  const { titulo, mensaje, tipo } = notification;

  const getIcono = () => {
    switch (tipo) {
      case 'assignment':
        return 'fa-user-plus';
      case 'reminder':
        return 'fa-clock';
      case 'coordinator':
        return 'fa-user-tie';
      default:
        return 'fa-bell';
    }
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className={`fas ${getIcono()} text-indigo-600`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">{titulo}</span>
              <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mensaje}</p>
          </div>
        </div>
      </div>
      
      <div className="h-1 bg-slate-100 rounded-b-2xl overflow-hidden">
        <div 
          className="h-full bg-indigo-500 rounded-b-2xl animate-pulse"
          style={{ width: '100%' }}
        ></div>
      </div>
    </div>
  );
}