# Documentación de la API - Ecclesia Flow

Esta guía detalla los endpoints y las estructuras JSON que el frontend espera del backend en Java (Spring Boot).

## Configuración Base
La URL base por defecto es `https://anunciaig.com/`. Puedes cambiarla en el archivo `.env`.

---

## 1. Usuarios (`/users`)

### GET `/api/users`
Retorna la lista de todos los servidores.

**Respuesta Ejemplo:**
```json
[
  {
    "id": "u1",
    "name": "Juan Pérez",
    "role": "Líder de Alabanza",
    "ministry": "Alabanza",
    "email": "juan.perez@iglesia.com",
    "phone": "+57 300 123 4567",
    "avatar": "https://picsum.photos/seed/juan/200/200",
    "active": true
  }
]
```

---

## 2. Ministerios (`/ministries`)

### GET `/api/ministries`
Lista los ministerios y sus posiciones disponibles.

**Respuesta Ejemplo:**
```json
[
  {
    "id": "m1",
    "name": "Alabanza",
    "positions": [
      { "id": "p1", "name": "Guitarra" },
      { "id": "p2", "name": "Bajo" },
      { "id": "p3", "name": "Batería" },
      { "id": "p4", "name": "Piano" },
      { "id": "p5", "name": "Voz" }
    ]
  }
]
```

### POST `/api/ministries`
Crea un nuevo ministerio.

**Cuerpo (Request):**
```json
{
  "name": "Audiovisuales",
  "positions": [
    { "id": "p6", "name": "Cámara" },
    { "id": "p7", "name": "Sonido" }
  ]
}
```

---

## 3. Programación / Eventos (`/events`)

### GET `/api/events`
Obtiene la programación de actividades.

**Respuesta Ejemplo:**
```json
[
  {
    "id": "e1",
    "date": "2024-05-19",
    "time": "09:00 AM",
    "coordinator": {
      "name": "Pastor Mario",
      "date": "2024-05-19"
    },
    "ministries": {
      "Alabanza": [
        { "positionId": "p5", "position": "Voz Principal", "personName": "Juan Pérez" },
        { "positionId": "p2", "position": "Bajo", "personName": "Maria Lopez" }
      ],
      "Kids": [
        { "positionId": "p10", "position": "Maestro", "personName": "Elena Torres" }
      ]
    }
  }
]
```

### POST `/api/events`
Publica una nueva programación.

**Cuerpo (Request):**
```json
{
  "date": "2024-06-01",
  "time": "10:00 AM",
  "coordinator": {
    "name": "Elena Torres",
    "date": "2024-06-01"
  },
  "ministries": {
    "Alabanza": [
      { "positionId": "p1", "position": "Guitarra", "personName": "Andrés Soto" }
    ]
  }
}
```

---

## 4. Tiempo con Dios - TCD (`/tcd`)

### GET `/api/tcd`
Lista las publicaciones de TCD.

**Respuesta Ejemplo:**
```json
[
  {
    "id": "t1",
    "userId": "u1",
    "userName": "Juan Pérez",
    "date": "2024-05-18",
    "image": "https://picsum.photos/seed/bible1/400/300"
  }
]
```

### POST `/api/tcd`
Sube una nueva entrada de TCD.

**Cuerpo (Request):**
```json
{
  "userId": "u1",
  "userName": "Juan Pérez",
  "date": "2024-05-20",
  "image": "data:image/png;base64,..."
}
```

---

## 5. Asignaciones / Habilidades (`/assignments`)

### GET `/api/assignments`
Lista las habilidades o especialidades de los servidores.

**Respuesta Ejemplo:**
```json
[
  {
    "id": "a1",
    "userId": "u1",
    "userName": "Juan Pérez",
    "ministryId": "m1",
    "ministryName": "Alabanza",
    "positionId": "p5",
    "positionName": "Voz"
  }
]
```

### POST `/api/assignments`
Registra una nueva habilidad para un servidor.

**Cuerpo (Request):**
```json
{
  "userId": "u2",
  "userName": "Andrés Soto",
  "ministryId": "m1",
  "ministryName": "Alabanza",
  "positionId": "p3",
  "positionName": "Batería"
}
```
