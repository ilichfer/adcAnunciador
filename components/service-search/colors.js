

// ─── Colores por ministerio (cíclico) ─────────────────────────────────────────
export const COLORS = [
  { bg: 'bg-indigo-600',  light: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200'  },
  { bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-purple-600',  light: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
  { bg: 'bg-rose-600',    light: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200'    },
  { bg: 'bg-amber-600',   light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  { bg: 'bg-cyan-600',    light: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200'    },
];

export const color = (i) => COLORS[i % COLORS.length];

// ─── Tarjeta de ministerio (con botón Editar) ─────────────────────────────────
