// Exporta el reporte de cumplimiento TCD a Excel y PDF.
// Las librerías se cargan solo al exportar, para no hacer más pesada la app.

const titulo = (desde, hasta) => `Reporte TCD ${desde} al ${hasta}`;

const filas = (datos) => [...datos]
  .sort((a, b) => (b.cantidadEntregados ?? 0) - (a.cantidadEntregados ?? 0))
  .map((r, i) => ({
    puesto: i + 1,
    nombre: r.nombre,
    entregados: r.cantidadEntregados ?? 0,
    porcentaje: r.porcentajeCumplimiento != null ? Math.round(r.porcentajeCumplimiento) : null,
  }));

export async function exportarExcel(datos, desde, hasta) {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const encabezado = (value) => ({ value, fontWeight: 'bold', backgroundColor: '#E0E7FF' });
  const data = [
    [{ value: titulo(desde, hasta), fontWeight: 'bold', fontSize: 14, columnSpan: 4 }, null, null, null],
    [],
    [encabezado('#'), encabezado('Nombre'), encabezado('TCD entregados'), encabezado('% cumplimiento')],
    ...filas(datos).map((f) => [
      { type: Number, value: f.puesto },
      { type: String, value: f.nombre ?? '' },
      { type: Number, value: f.entregados },
      f.porcentaje != null ? { type: Number, value: f.porcentaje / 100, format: '0%' } : { type: String, value: '—' },
    ]),
  ];
  await writeExcelFile(data, {
    columns: [{ width: 6 }, { width: 36 }, { width: 16 }, { width: 16 }],
    sheet: 'TCD',
  }).toFile(`reporte-tcd-${desde}-a-${hasta}.xlsx`);
}

export async function exportarPdf(datos, desde, hasta) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  doc.setFontSize(16);
  doc.text('Anunciadores de Cristo', 40, 50);
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(titulo(desde, hasta), 40, 70);
  const total = datos.reduce((s, r) => s + (r.cantidadEntregados ?? 0), 0);
  doc.text(`Personas: ${datos.length}   ·   TCD entregados: ${total}`, 40, 88);

  autoTable(doc, {
    startY: 105,
    head: [['#', 'Nombre', 'TCD entregados', '% cumplimiento']],
    body: filas(datos).map((f) => [f.puesto, f.nombre ?? '', f.entregados, f.porcentaje != null ? `${f.porcentaje}%` : '—']),
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: { 0: { halign: 'right', cellWidth: 30 }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    styles: { fontSize: 10 },
  });
  doc.setFontSize(8);
  doc.text(`Generado el ${new Date().toLocaleString('es-CO')}`, 40, doc.internal.pageSize.getHeight() - 20);
  doc.save(`reporte-tcd-${desde}-a-${hasta}.pdf`);
}
