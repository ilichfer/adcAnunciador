import { useState } from 'react';
import { color } from './colors.js';
import { MinistryEditor } from './MinistryEditor.jsx';
import { CoordinatorEditor } from './CoordinatorEditor.jsx';

export function MinistryCard({ ministry, colorIndex, onEdit }) {
  const c           = color(colorIndex);
  const { id, name, positions = [] } = ministry;

  return (
    <div className={`rounded-2xl border ${c.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${c.bg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <i className="fas fa-sitemap text-white/70 text-xs"></i>
          <h4 className="text-white font-black text-xs uppercase tracking-widest capitalize">
            {name}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[10px] font-bold">
            {positions.length} {positions.length === 1 ? 'persona' : 'personas'}
          </span>
          {/* ← Pasa id, name, colorIndex y posiciones originales al editor */}
          <button
            onClick={() => onEdit({ id, name, colorIndex, originalPositions: positions })}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/35 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-colors"
          >
            <i className="fas fa-pen text-[9px]"></i>
            Editar
          </button>
        </div>
      </div>

      {/* Lista de posiciones */}
      <div className={`${c.light} divide-y divide-white/60`}>
        {positions.map((item) => (
          <div key={item.positionId} className="flex items-center gap-3 px-4 py-2.5">
            <div className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-bold text-[10px]">
                {item.personName?.trim().charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{item.personName?.trim()}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${c.text} capitalize`}>
                {item.position}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vista de edición de un ministerio ───────────────────────────────────────
// Recibe: { id, name, colorIndex } — hace fetch de posiciones y personas en paralelo

export function ServiceView({ data, date, onRefresh }) {
  const [editing, setEditing] = useState(null); // { id, name, colorIndex } | null
  const [editingCoord, setEditingCoord] = useState(false);

  // Formato nuevo: [ { id, name, positions: [...] }, ... ]
  const ministerios = (data.ministries ?? []).map((m, i) => ({
    id:        m.id,
    name:      m.name,
    positions: Array.isArray(m.positions) ? m.positions : [],
    colorIndex: i,
  }));


  if (editing) {
    return (
      <MinistryEditor
        ministry={editing}
        date={date}
        onBack={() => setEditing(null)}
        onSaved={() => { setEditing(null); onRefresh(); }}
      />
    );
  }

  if (editingCoord) {
    return (
      <CoordinatorEditor
        currentCoordinator={data.coordinator}
        date={date}
        onBack={() => setEditingCoord(false)}
        onSaved={() => { setEditingCoord(false); onRefresh(); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      

      {/* Coordinador */}
      {data.coordinator ? (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-user-shield text-white text-sm"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Coordinador General</p>
                <p className="font-bold text-slate-800">{data.coordinator?.name ?? data.coordinator}</p>
              </div>
            </div>
            <button
              onClick={() => setEditingCoord(true)}
              className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors border border-emerald-200"
            >
              <i className="fas fa-user-edit mr-1"></i> Editar
            </button>
          </div>
          {data.coordinator.notasServicio ? (
            <div className="bg-white border border-emerald-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Mensaje del Coordinador</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.coordinator.notasServicio}</p>
            </div>
          ) : (
            <div className="bg-white border border-emerald-100 rounded-xl p-3">
              <p className="text-sm text-slate-400 italic">No hay mensaje por parte del coordinador</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Grilla de ministerios */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ministerios.map((m) => (
          <MinistryCard
            key={`${m.id}-${m.name}`}
            ministry={m}
            colorIndex={m.colorIndex}
            onEdit={setEditing}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────

export function Empty({ date }) {
  return (
    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <i className="fas fa-calendar-times text-slate-300 text-4xl mb-4 block"></i>
      <p className="font-bold text-slate-500">Sin programación</p>
      <p className="text-slate-400 text-sm mt-1">No se encontró ningún servicio para el {date}.</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
