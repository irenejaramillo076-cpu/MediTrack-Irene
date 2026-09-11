require('dotenv').config({ quiet: true });
const db = require('./database');
const bcrypt = require('bcryptjs');
const demo = require('./demo.json');
function seed() {
  db.exec('BEGIN IMMEDIATE');
  try {
    if (!db.prepare('SELECT COUNT(*) AS n FROM users').get().n) {
      const credentials = [['admin@meditrack.test','Admin123*'],['recepcion@meditrack.test','Recepcion123*'],['medico@meditrack.test','Medico123*']];
      demo.demoUsers.slice(0,3).forEach((u,i) => db.prepare('INSERT INTO users(nombre,email,password_hash,rol,area,estado) VALUES (?,?,?,?,?,?)').run(u.nombre, credentials[i][0], bcrypt.hashSync(credentials[i][1],12), u.rol,u.area,u.estado));
    }
    if (!db.prepare('SELECT COUNT(*) AS n FROM doctors').get().n) demo.demoDoctors.forEach(d => db.prepare('INSERT INTO doctors(id,nombre,especialidad,registro,turno,estado) VALUES (?,?,?,?,?,?)').run(d.id,d.nombre,d.especialidad,d.registro,d.turno,d.estado));
    if (!db.prepare('SELECT COUNT(*) AS n FROM patients').get().n) {
      demo.demoPatients.forEach(p => {
        const [nombre,...last] = p.nombre.split(' ');
        db.prepare('INSERT INTO patients(id,expediente,nombre,apellido,identificacion,fecha_nacimiento,sangre,telefono,correo,estado) VALUES (?,?,?,?,?,?,?,?,?,?)').run(p.id,p.expediente,nombre,last.join(' '),p.identificacion,`${2026-p.edad}-01-15`,p.sangre,p.telefono,p.correo,p.estado);
        p.seguimiento.forEach((description,i) => db.prepare('INSERT INTO patient_followups(patient_id,fecha,descripcion,estado) VALUES (?,?,?,?)').run(p.id, i === 0 ? p.ultima.split('/').reverse().join('-') : `2026-0${7-i}-15`,i === 0 ? p.ultimaConsulta : description,i === 0 ? p.estado : 'FINALIZADA'));
      });
      demo.demoAppointments.forEach(a => {
        const doctor = db.prepare('SELECT id FROM doctors WHERE nombre = ?').get(a.medico);
        db.prepare('INSERT INTO appointments(patient_id,doctor_id,especialidad,fecha,hora,estado) VALUES (?,?,?,?,?,?)').run(a.pacienteId,doctor.id,a.especialidad,a.fecha,a.hora,a.estado);
      });
    }
    db.exec('COMMIT');
  } catch(error) { db.exec('ROLLBACK'); throw error; }
}
if (require.main === module) { seed(); db.close(); console.log('SQLite inicializada con datos demo. Los registros existentes se conservan.'); }
module.exports = seed;
