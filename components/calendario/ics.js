// Exportar turnos a Google Calendar / calendario del celular (formato iCalendar .ics).

const compacta = (iso) => iso.replaceAll('-', '');

const diaSiguiente = (iso) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const titulo = (e) => `${e.posicion} - ${e.ministerio}`;

/** Enlace "Agregar a Google Calendar" para un solo turno (evento de día completo). */
export function urlGoogle(e) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo(e),
    dates: `${compacta(e.fecha)}/${compacta(diaSiguiente(e.fecha))}`,
    details: `Servicio en ${e.ministerio} como ${e.posicion}. Servidor: ${e.persona}. https://anunciaig.com/#/calendario`,
    ctz: 'America/Bogota',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const escapar = (t) => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export function crearIcs(eventos, nombre = 'Turnos - Anunciadores de Cristo') {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lineas = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Anunciadores de Cristo//Turnos//ES',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${escapar(nombre)}`,
  ];
  for (const e of eventos) {
    lineas.push(
      'BEGIN:VEVENT',
      `UID:servicio-${e.idServicio}@anunciaig.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compacta(e.fecha)}`,
      `DTEND;VALUE=DATE:${compacta(diaSiguiente(e.fecha))}`,
      `SUMMARY:${escapar(titulo(e) + (e.confirmacion === 'NO_PUEDE' ? ' (no puedo asistir)' : ''))}`,
      `DESCRIPTION:${escapar(`Servidor: ${e.persona}`)}`,
      'END:VEVENT',
    );
  }
  lineas.push('END:VCALENDAR');
  return lineas.join('\r\n') + '\r\n';
}

export function descargarIcs(eventos, archivo = 'turnos.ics') {
  const blob = new Blob([crearIcs(eventos)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = archivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
