// Reduce el tamaño de la foto en el propio celular antes de subirla
// (las fotos de celular pesan 3-8 MB; así suben más rápido con datos móviles).

const LADO_MAXIMO = 1600;
const CALIDAD = 0.82;
const MINIMO_PARA_COMPRIMIR = 400 * 1024; // las fotos pequeñas se suben tal cual

/**
 * Devuelve un File JPEG más liviano. Si el navegador no puede leer la imagen
 * (por ejemplo un formato raro) o el resultado no es menor, devuelve el original.
 */
export async function comprimirImagen(file) {
  if (!file || !file.type.startsWith('image/') || file.type === 'image/gif' || file.size < MINIMO_PARA_COMPRIMIR) {
    return file;
  }
  try {
    const bitmap = await crearBitmap(file);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);

    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // fondo blanco para PNG con transparencia
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', CALIDAD));
    if (!blob || blob.size >= file.size) return file;
    const nombre = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], nombre, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

async function crearBitmap(file) {
  if ('createImageBitmap' in window) {
    // Respeta la orientación de la foto (EXIF) en navegadores modernos
    return createImageBitmap(file, { imageOrientation: 'from-image' });
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
