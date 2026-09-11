# Hito 3 / Hito 4 — Guía de evidencias

Use exclusivamente datos ficticios. Abra el proyecto en VS Code, el navegador en `http://localhost:3000` y DevTools → Network (Fetch/XHR). Para inspeccionar SQLite puede usar un visor SQLite disponible en su equipo. Inicie como Administrador y use el paciente «Elena Prueba», identificación `EVIDENCIA-001`.

Guarde las imágenes con los nombres siguientes y en este orden. No incluya el valor de SESSION_SECRET, contraseñas escritas en formularios ni el valor completo de cookies.

| Nº / archivo sugerido | Captura exacta |
| --- | --- |
| 01-estructura.png | Explorador de VS Code mostrando server.js, package.json, database, middleware, routes, utils, public, test y docs. |
| 02-instalacion.png | Terminal tras `npm install` (o `npm.cmd install`), mostrando fin de instalación. Si aparecen avisos npm, consérvelos; están documentados en README. |
| 03-servidor.png | Terminal tras `npm start`, con `MediTrack 360: http://localhost:3000`. |
| 04-sqlite.png | Ejecute `npm run db:init`; capture mensaje de inicialización y el archivo database/meditrack.db en el explorador. |
| 05-tablas.png | Visor de database/meditrack.db mostrando users, patients, patient_followups, doctors y appointments. Puede mostrar también claves e índices de schema.sql. |
| 06-formulario.png | public/index.html mostrando `<form id="patientForm" action="/api/patients" method="POST">` y campos con name. El atributo novalidate también aparece en el código. |
| 07-get.png | public/js/script.js, función refreshData, comentario GET y llamadas api('GET', ...). Incluya Network con GET /api/patients, estado 200 y JSON. |
| 08-post.png | public/js/script.js, función saveForm, comentario POST/PUT y llamada AJAX; incluya routes/crud.js con router.post e INSERT parametrizado. |
| 09-sanitizacion.png | utils/sanitize.js mostrando sanitizeHtml, trim y validadores de correo/longitud. Puede acompañar con una petición inválida que responda 400. |
| 10-prepared.png | routes/auth.routes.js con SELECT por email y `?`, y routes/crud.js con `.run(...values)` y placeholders. |
| 11-login.png | Login exitoso: dashboard y chip con nombre y rol Administrador. Network debe mostrar POST /api/auth/login, estado 200. |
| 12-sesion.png | Abra /api/auth/session: JSON con id, nombre y rol. En Application → Cookies muestre el nombre meditrack.sid y atributos HttpOnly/SameSite, ocultando su valor. También puede mostrar la tabla sessions en sessions.sqlite ocultando sid. |
| 13-paciente-antes.png | Vista Pacientes antes de registrar Elena Prueba; muestre contador y listado. |
| 14-registro.png | Registre Elena Prueba, EVIDENCIA-001, 1995-05-10, O+, 6000-1234, elena@example.test, ACTIVO. Capture mensaje exitoso, fila nueva y POST con estado 201. |
| 15-persistencia.png | En SQLite ejecute la consulta inferior para EVIDENCIA-001. Detenga Node con Ctrl+C, vuelva a ejecutar npm start y refresque: capture la fila persistida. La sesión debe seguir activa. |
| 16-edicion.png | Pulse EDITAR en Elena, cambie teléfono a 6000-5678 y guarde. Capture PUT /api/patients/ID con estado 200 y respuesta actualizada. |
| 17-eliminacion.png | Pulse ELIMINAR, capture confirmación y luego DELETE /api/patients/ID con estado 200 y fila ausente. El paciente no debe tener citas asociadas. |
| 18-cita.png | Cree una cita para Ana González con Medicina General / Dr. Luis Herrera en un horario libre. Capture fila, POST /api/appointments y estado 201. Intente duplicarla para mostrar validación; para evidenciar validación del servidor, repita el POST en DevTools/Postman y capture 409. |
| 19-logout.png | Pulse Cerrar sesión. Capture pantalla de login, chip Invitado y POST /api/auth/logout con estado 200. |
| 20-protegida.png | Sin iniciar sesión, abra http://localhost:3000/api/patients. Capture JSON success:false y estado HTTP 401 en Network. |
| 21-github.png | Después de revisar y subir sus cambios, capture la página de GitHub con estructura final, README y último commit. No suba .env, bases de datos ni node_modules. |

## Consultas de apoyo

Ejecute en el visor de `database/meditrack.db`:

```sql
SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;
SELECT id, expediente, nombre, apellido, identificacion, telefono
FROM patients WHERE identificacion = 'EVIDENCIA-001';
SELECT id, nombre, email, rol, estado FROM users;
SELECT id, patient_id, doctor_id, fecha, hora, estado FROM appointments;
PRAGMA foreign_key_list(appointments);
PRAGMA index_list(appointments);
```

Para demostrar hashes, muestre únicamente un prefijo: `SELECT email, substr(password_hash, 1, 7) AS algoritmo FROM users;`.

Si no tiene visor SQLite, use la terminal de Node desde la carpeta del proyecto:

```sh
node -e "const db=require('./database/database'); console.table(db.prepare('SELECT id, expediente, nombre, apellido, identificacion FROM patients').all()); db.close()"
```

## Evidencia adicional recomendada

Capture `npm test` con las siete pruebas aprobadas. Incluyen reinicio real de Node y conservación de sesión, prueba concurrente de horario y recorrido del frontend. La suite usa una base temporal independiente.

La captura 21 requiere subir los cambios con su cuenta; esta implementación prepara los archivos locales y no publica automáticamente el repositorio.
