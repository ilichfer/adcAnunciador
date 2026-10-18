import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAppStore } from '../store/UseAppStore.jsx';
import { useApi } from './useApi.js';
import { Loader, MinistryCard } from './ministry/MinistryCards.jsx';
import { MinistryDetailsView } from './ministry/MinistryDetailsView.jsx';
import { AddPositionForm, AssignForm } from './ministry/MinistryForms.jsx';
import { SchedulePlanner } from './ministry/SchedulePlanner.jsx';
import { CoordinatorScheduler } from './ministry/CoordinatorScheduler.jsx';

const MinistryManager = () => {
  const { authFetch } = useAuth();
  const { getUrl } = useApi();

  // ── Store ──────────────────────────────────────────────────────────────────
  const storeMinistries    = useAppStore(s => s.ministries);
  const storeUsers         = useAppStore(s => s.users);
  const addEvent           = useAppStore(s => s.addEvent);
  const removeAssignment   = useAppStore(s => s.removeAssignment);
  const removeMinistry     = useAppStore(s => s.removeMinistry);
  const setActiveTab       = useAppStore(s => s.setActiveTab);

  // ── Estado local: solo UI ──────────────────────────────────────────────────
  const [view, setView]               = useState('list');
  const [ministries, setMinistries]   = useState([]);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedMinId, setSelectedMinId] = useState(null);
  const [addMinistries, setAddMinistries] = useState(null);

  const handleAddAssignment = (ministry) => {
    setAddMinistries(ministry);
    setView('assign');
  };

  const handleOpenAddPosition = (ministry) => {
    setAddMinistries(ministry);
    setView('add-position');
  };

  const handleSavePosition = async (idMinisterio, nombrePosicion) => {
    try {
      const res = await authFetch(getUrl(`/ministries/addposition`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idMinisterio, nombrePosicion }),
      });
      if (!res.ok) throw new Error();
      alert('Posición agregada con éxito.');
      setView('details');
    } catch (err) {
      alert('Error: No se pudo agregar la posición.');
    }
  };

  const handleAddPerson = async (idMinisterio, uId) => {
    try {
      const res = await authFetch(getUrl(`/ministeries/addperson`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPersona: uId, idMinisterio }),
      });
      if (!res.ok) alert('Error: No se pudo agregar la persona al ministerio.');
    } catch (err) {
      alert('Error de conexión al intentar agregar.');
    }
  };

  const handleDeleteAssignment = async (mId, sId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar a esta persona del ministerio?')) return;
    try {
      const res = await authFetch(getUrl(`/ministeries/${mId}/personas/${sId}`), { method: 'DELETE' });
      if (res.ok) {
        removeAssignment(mId); // actualiza el store
      } else {
        alert('Error: No se pudo eliminar la asignación en el servidor.');
      }
    } catch (err) {
      alert('Error de conexión al intentar eliminar.');
    }
  };

  // Fetch: usa datos del store si ya existen; si no, hace la petición.
  // Dependencias vacías [] → se ejecuta solo una vez al montar.
  // Los datos del store se leen en el momento de ejecutarse, sin crear un ciclo.
  useEffect(() => {
    if (storeMinistries.length > 0 && storeUsers.length > 0) {
      setMinistries(storeMinistries);
      setUsers(storeUsers);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      authFetch(getUrl(`/ministries`)).then(r => r.json()),
      authFetch(getUrl(`/users`)).then(r => r.json()),
    ])
      .then(([ministriesData, usersData]) => {
        setMinistries(Array.isArray(ministriesData) ? ministriesData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navBtn = (targetView, label, icon, color = 'indigo') => (
    <button
      onClick={() => setView(targetView)}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
        view === targetView
          ? color === 'emerald'
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      <i className={`fas ${icon}`}></i>{label}
    </button>
  );

  const handleManageMinistry = (id) => {
    setSelectedMinId(id);
    setView('details');
  };

  const handleSaveCoordinator = async (fecha, idPersona) => {

const requestCordinador = {
  fechaString:fecha,
  idPersona: idPersona
};

    return authFetch(getUrl(`/savecordinador`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestCordinador),
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Panel de Ministerios</h2>
        <div className="flex flex-wrap gap-2">
          {navBtn('create-schedule', 'Nueva Programación', 'fa-calendar-plus', 'emerald')}
          {navBtn('list',            'Ver Estructura',     'fa-th-list')}
          {navBtn('schedule-coordinator', 'Programar Coordinador', 'fa-user-tie')}
        </div>
      </div>

      {view === 'create-schedule' && (
        <SchedulePlanner
          ministries={ministries} users={users}
          authFetch={authFetch}
          onSave={(
            
            ev) => {
            addEvent(ev);       // guarda en el store
            setActiveTab('schedule'); // navega al tab de schedule
            setView('list');
          }}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'schedule-coordinator' && (
        <CoordinatorScheduler 
          users={users} 
          onCancel={() => setView('list')}
          onSave={handleSaveCoordinator}
        />
      )}

      {view === 'details' && selectedMinId && (
        <MinistryDetailsView
          ministry={ministries.find(m => m.id === selectedMinId)}
          onBack={() => setView('list')}
          onRemoveMember={handleDeleteAssignment}
          onAddAssignment={handleAddAssignment}
          onAddPosition={handleOpenAddPosition}
        />
      )}

      {view === 'add-position' && addMinistries && (
        <AddPositionForm
          ministry={addMinistries}
          onCancel={() => setView('details')}
          onSave={handleSavePosition}
        />
      )}

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest px-2">
              Estructuras Activas
              <span className="ml-2 normal-case font-medium text-slate-300">({ministries.length})</span>
            </h3>
            {ministries.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-14 text-center">
                <i className="fas fa-sitemap text-slate-300 text-3xl mb-3 block"></i>
                <p className="text-slate-400 text-sm">No hay ministerios disponibles.</p>
              </div>
            ) : (
              ministries.map(m => (
                <MinistryCard key={m.id} ministry={m}
                  onRemove={removeMinistry}
                  onManage={handleManageMinistry}
                />
              ))
            )}
          </div>
        </div>
      )}

      {view === 'assign' && addMinistries && (
        <AssignForm
          ministries={ministries} users={users}
          onCancel={() => setView('list')}
          onAddMinistries={addMinistries}
          onAddPerson={async (idMinisterio, uId) => {
            await handleAddPerson(idMinisterio, uId);
            setView('details');
          }}
        />
      )}
    </div>
  );
};

export default MinistryManager;
