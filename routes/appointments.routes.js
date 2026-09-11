const db = require('../database/database');
const v = require('../utils/sanitize');
module.exports = require('./crud')({
  table: 'appointments', columns: ['patient_id','doctor_id','especialidad','fecha','hora','estado'],
  select: "SELECT appointments.*, patients.nombre || ' ' || patients.apellido AS paciente, doctors.nombre AS medico FROM appointments JOIN patients ON patients.id = appointments.patient_id JOIN doctors ON doctors.id = appointments.doctor_id",
  validate(body, id) {
    const patient = v.id(body.patient_id), doctor = v.id(body.doctor_id);
    if (!db.prepare('SELECT id FROM patients WHERE id = ?').get(patient)) v.fail(400, 'Paciente inexistente.');
    const row = db.prepare('SELECT especialidad FROM doctors WHERE id = ?').get(doctor);
    if (!row) v.fail(400, 'Médico inexistente.');
    const specialty = v.text(body.especialidad, 'Especialidad', 80);
    if (specialty !== row.especialidad) v.fail(400, 'La especialidad no corresponde al médico.');
    const date = v.date(body.fecha), time = v.text(body.hora, 'Hora', 5);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) v.fail(400, 'Hora inválida.');
    const state = v.choice(body.estado || 'PROGRAMADA', ['PROGRAMADA','CONFIRMADA','EN ESPERA','FINALIZADA','CANCELADA'], 'Estado');
    if (state !== 'CANCELADA' && db.prepare("SELECT id FROM appointments WHERE doctor_id = ? AND fecha = ? AND hora = ? AND estado <> 'CANCELADA' AND id <> ?").get(doctor, date, time, id || 0)) v.fail(409, 'Ese médico ya tiene una cita en esa fecha y hora.');
    return [patient, doctor, specialty, date, time, state];
  }
});
