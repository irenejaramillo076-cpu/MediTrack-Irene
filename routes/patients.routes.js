const db = require('../database/database');
const v = require('../utils/sanitize');
module.exports = require('./crud')({
  table: 'patients',
  columns: ['expediente','nombre','apellido','identificacion','fecha_nacimiento','sangre','telefono','correo','estado'],
  validate(body, id) {
    const expediente = id ? db.prepare('SELECT expediente FROM patients WHERE id = ?').get(id).expediente : `MED-${new Date().getFullYear()}-${require('node:crypto').randomUUID().slice(0, 8).toUpperCase()}`;
    const phone = v.text(body.telefono, 'Teléfono', 30, false);
    if (phone && !/^[+\d\s()-]{5,30}$/.test(phone)) v.fail(400, 'Teléfono inválido.');
    return [expediente, v.text(body.nombre, 'Nombre', 80), v.text(body.apellido, 'Apellido', 80), v.text(body.identificacion, 'Identificación', 40), v.date(body.fecha_nacimiento, true), v.choice(body.sangre, ['O+','O-','A+','A-','B+','B-','AB+','AB-'], 'Sangre'), phone, v.email(body.correo, false), v.choice(body.estado, ['ACTIVO','SEGUIMIENTO','CONTROL'], 'Estado')];
  },
  decorate(row) {
    row.seguimientos = db.prepare('SELECT * FROM patient_followups WHERE patient_id = ? ORDER BY fecha DESC, id DESC').all(row.id);
    return row;
  }
});
