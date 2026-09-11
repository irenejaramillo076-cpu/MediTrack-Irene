const v = require('../utils/sanitize');
module.exports = require('./crud')({
  table: 'doctors', columns: ['nombre','especialidad','registro','turno','estado'],
  validate(body) {
    const shift = v.text(body.turno, 'Turno', 30);
    if (!/^([01]\d|2[0-3]):[0-5]\d\s*[-–]\s*([01]\d|2[0-3]):[0-5]\d$/.test(shift)) v.fail(400, 'Turno: use HH:mm–HH:mm.');
    return [v.text(body.nombre, 'Nombre'), v.text(body.especialidad, 'Especialidad', 80), v.text(body.registro, 'Registro', 40).toUpperCase(), shift, v.choice(body.estado, ['DISPONIBLE','EN CONSULTA','PRÓXIMO TURNO'], 'Estado')];
  }
});
