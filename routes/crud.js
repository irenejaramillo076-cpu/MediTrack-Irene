const db = require('../database/database');
const v = require('../utils/sanitize');
const { requireAuth } = require('../middleware/auth');
// Tablas y columnas internas; valores parametrizados.
module.exports = function crud({ table, columns, validate, select, decorate = row => row }) {
  const router = require('express').Router();
  router.use(requireAuth);
  const query = select || `SELECT * FROM ${table}`;
  function get(id) {
    const row = db.prepare(`${query} WHERE ${table}.id = ?`).get(id);
    if (!row) v.fail(404, 'Registro no encontrado.');
    return decorate(row);
  }
  router.get('/', (req, res) => res.json({ success: true, message: 'Listado obtenido.', data: db.prepare(query).all().map(decorate) }));
  router.get('/:id', (req, res) => res.json({ success: true, message: 'Registro obtenido.', data: get(v.id(req.params.id)) }));
  router.post('/', (req, res) => {
    const values = validate(req.body);
    const result = db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`).run(...values);
    res.status(201).json({ success: true, message: 'Registro creado.', data: get(Number(result.lastInsertRowid)) });
  });
  router.put('/:id', (req, res) => {
    const id = v.id(req.params.id);
    get(id);
    const values = validate(req.body, id);
    db.prepare(`UPDATE ${table} SET ${columns.map(c => `${c} = ?`).join(',')} ${table === 'patients' ? ', updated_at = CURRENT_TIMESTAMP' : ''} WHERE id = ?`).run(...values, id);
    res.json({ success: true, message: 'Registro actualizado.', data: get(id) });
  });
  router.delete('/:id', (req, res) => {
    const id = v.id(req.params.id);
    get(id);
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    res.json({ success: true, message: 'Registro eliminado.', data: null });
  });
  return router;
};
