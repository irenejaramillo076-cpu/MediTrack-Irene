# Endpoints de MediTrack 360

Base: `http://localhost:3000`. Todas las respuestas API son JSON:

```json
{"success":true,"message":"Registro obtenido.","data":{}}
```

En errores, `success` es `false` y `data` es `null`. La cookie `meditrack.sid` autentica las peticiones; no se envía un rol para conceder permisos.

| Método | Ruta | Descripción | Protegida |
| --- | --- | --- | --- |
| POST | /api/auth/login | Validar email y password; crear sesión | No |
| POST | /api/auth/logout | Destruir sesión y retirar cookie | No; idempotente |
| GET | /api/auth/session | Consultar id, nombre y rol autenticados | Sí |
| GET | /api/patients | Listar pacientes con seguimientos | Sí |
| GET | /api/patients/:id | Consultar expediente y seguimientos | Sí |
| POST | /api/patients | Registrar paciente | Sí |
| PUT | /api/patients/:id | Actualizar paciente completo | Sí |
| DELETE | /api/patients/:id | Eliminar paciente sin citas asociadas | Sí |
| GET | /api/doctors | Listar personal médico | Sí |
| GET | /api/doctors/:id | Consultar médico | Sí |
| POST | /api/doctors | Registrar médico | Sí |
| PUT | /api/doctors/:id | Actualizar médico completo | Sí |
| DELETE | /api/doctors/:id | Eliminar médico sin citas asociadas | Sí |
| GET | /api/appointments | Listar citas con nombres de paciente y médico | Sí |
| GET | /api/appointments/:id | Consultar cita | Sí |
| POST | /api/appointments | Crear cita; impedir horario duplicado | Sí |
| PUT | /api/appointments/:id | Actualizar cita completa | Sí |
| DELETE | /api/appointments/:id | Eliminar cita | Sí |
| GET | /api/users | Listar usuarios sin hashes | Sí, Administrador |
| POST | /api/users | Crear usuario con contraseña cifrada | Sí, Administrador |
| PUT | /api/users/:id | Activar/desactivar usuario | Sí, Administrador |

## Cuerpos de petición

Login:
```json
{"email":"admin@meditrack.test","password":"Admin123*"}
```

Paciente (POST y PUT; el expediente se genera en el servidor y se conserva al editar):
```json
{"nombre":"Elena","apellido":"Prueba","identificacion":"EVIDENCIA-001","fecha_nacimiento":"1995-05-10","sangre":"O+","telefono":"6000-1234","correo":"elena@example.test","estado":"ACTIVO"}
```

Médico:
```json
{"nombre":"Dra. Prueba","especialidad":"Medicina General","registro":"MED-9999","turno":"08:00–16:00","estado":"DISPONIBLE"}
```

Cita (los IDs deben existir y la especialidad corresponder al médico):
```json
{"patient_id":1,"doctor_id":4,"especialidad":"Medicina General","fecha":"2026-12-01","hora":"11:00","estado":"PROGRAMADA"}
```

Nuevo usuario:
```json
{"nombre":"Usuario Prueba","email":"usuario@example.test","password":"Prueba123*","rol":"Recepción","area":"Admisión"}
```

Estado de usuario: `{"estado":"INACTIVO"}`. No se permite desactivar la propia cuenta. Cada petición protegida verifica en BD que la cuenta siga activa.

## Estados HTTP

| Código | Situación |
| --- | --- |
| 200 | Lectura, actualización, eliminación o autenticación correcta |
| 201 | Registro creado |
| 400 | Campo inválido, fecha imposible, ID inválido, JSON mal formado |
| 401 | Sesión ausente/expirada o credenciales inválidas |
| 403 | Rol insuficiente u origen externo en una escritura |
| 404 | Registro o ruta inexistente |
| 409 | Identificación/registro/horario duplicado o registro con citas asociadas |
| 413 | Cuerpo superior a 32 KB |
| 500 | Error interno, sin revelar SQL ni detalles internos |
