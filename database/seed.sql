PRAGMA foreign_keys = ON;

-- Usuarios demo con hash bcrypt.
INSERT INTO users(nombre,email,password_hash,rol,area,estado) VALUES ('María Pérez','admin@meditrack.test','$2b$10$3jzJ1JtFP5XsMHMzfBtzpOXTbZ0Zx/P91JRNFEw1w0uXNSb1Jn.pu','Administrador','Sistemas','ACTIVO');
INSERT INTO users(nombre,email,password_hash,rol,area,estado) VALUES ('Luis Gómez','recepcion@meditrack.test','$2b$10$BROAwEzovzd3uaEvG.pG9uPR2hm9SfiQf0GtX/PWb6/WxOhKrc7qm','Recepción','Admisión','ACTIVO');
INSERT INTO users(nombre,email,password_hash,rol,area,estado) VALUES ('Dra. Ana Ruiz','medico@meditrack.test','$2b$10$MJ4GWLAP0xNi8g6mwwJunOLN0ObGK/lCM5F5LV.I/wXvdsG0nt6g2','Médico','Cardiología','ACTIVO');

-- Pacientes demo
INSERT INTO patients(expediente,nombre,apellido,identificacion,fecha_nacimiento,sangre,telefono,correo,estado) VALUES ('MED-2026-0001','Ana','González','8-000-000','1992-04-12','O+','+507 6000-0000','ana@demo.test','ACTIVO');
INSERT INTO patients(expediente,nombre,apellido,identificacion,fecha_nacimiento,sangre,telefono,correo,estado) VALUES ('MED-2026-0002','Carlos','Méndez','8-111-111','1978-05-19','A+','+507 6111-1111','carlos@demo.test','SEGUIMIENTO');
INSERT INTO patients(expediente,nombre,apellido,identificacion,fecha_nacimiento,sangre,telefono,correo,estado) VALUES ('MED-2026-0003','Laura','Díaz','8-222-222','1997-02-10','B+','+507 6222-2222','laura@demo.test','ACTIVO');
INSERT INTO patients(expediente,nombre,apellido,identificacion,fecha_nacimiento,sangre,telefono,correo,estado) VALUES ('MED-2026-0004','José','Martínez','8-333-333','1965-07-25','O-','+507 6333-3333','jose@demo.test','CONTROL');
INSERT INTO patients(expediente,nombre,apellido,identificacion,fecha_nacimiento,sangre,telefono,correo,estado) VALUES ('MED-2026-0005','Sofía','Herrera','8-444-444','2009-01-15','AB+','+507 6444-4444','sofia@demo.test','ACTIVO');

-- Médicos demo
INSERT INTO doctors(nombre,especialidad,registro,turno,estado) VALUES ('Dra. Ana Ruiz','Cardiología','MED-0041','08:00–16:00','DISPONIBLE');
INSERT INTO doctors(nombre,especialidad,registro,turno,estado) VALUES ('Dr. José Díaz','Pediatría','MED-0036','07:00–15:00','EN CONSULTA');
INSERT INTO doctors(nombre,especialidad,registro,turno,estado) VALUES ('Dra. Carla Méndez','Dermatología','MED-0055','09:00–17:00','DISPONIBLE');
INSERT INTO doctors(nombre,especialidad,registro,turno,estado) VALUES ('Dr. Luis Herrera','Medicina General','MED-0028','12:00–20:00','PRÓXIMO TURNO');
INSERT INTO doctors(nombre,especialidad,registro,turno,estado) VALUES ('Dra. Sofía Pérez','Ginecología','MED-0062','08:00–16:00','DISPONIBLE');

-- Seguimientos demo
INSERT INTO patient_followups(patient_id,fecha,descripcion,estado) VALUES ('1','2026-08-28','Consulta general','SEGUIMIENTO');
INSERT INTO patient_followups(patient_id,fecha,descripcion,estado) VALUES ('1','2026-07-15','Control médico','FINALIZADA');
INSERT INTO patient_followups(patient_id,fecha,descripcion,estado) VALUES ('1','2026-06-03','Primera consulta','FINALIZADA');
INSERT INTO patient_followups(patient_id,fecha,descripcion,estado) VALUES ('2','2026-08-27','Consulta general','SEGUIMIENTO');
INSERT INTO patient_followups(patient_id,fecha,descripcion,estado) VALUES ('2','2026-08-02','Evaluación','FINALIZADA');
INSERT INTO patient_followups(patient_id,fecha,descripcion,estado) VALUES ('3','2026-08-25','Consulta de rutina','FINALIZADA');
INSERT INTO patient_followups(patient_id,fecha,descripcion,estado) VALUES ('4','2026-08-22','Control','PROGRAMADO');
INSERT INTO patient_followups(patient_id,fecha,descripcion,estado) VALUES ('5','2026-08-20','Seguimiento pediátrico','FINALIZADA');

-- Citas demo
INSERT INTO appointments(patient_id,doctor_id,especialidad,fecha,hora,estado) VALUES ('1','4','Medicina General','2026-09-07','08:30','CONFIRMADA');
INSERT INTO appointments(patient_id,doctor_id,especialidad,fecha,hora,estado) VALUES ('2','2','Pediatría','2026-09-07','09:00','EN ESPERA');
INSERT INTO appointments(patient_id,doctor_id,especialidad,fecha,hora,estado) VALUES ('3','1','Cardiología','2026-09-07','09:30','CONFIRMADA');
INSERT INTO appointments(patient_id,doctor_id,especialidad,fecha,hora,estado) VALUES ('4','4','Medicina General','2026-09-07','10:15','PROGRAMADA');