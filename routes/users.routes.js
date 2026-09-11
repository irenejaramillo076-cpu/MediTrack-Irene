const router = require('express').Router();
const db = require('../database/database');
const v = require('../utils/sanitize');
const bcrypt = require('bcryptjs');
const { requireAuth, requireAdmin } = require('../middleware/auth');
router.use(requireAuth, requireAdmin);
const list = () => db.prepare('SELECT id, nombre, email, rol, area, estado, created_at FROM users').all();
router.get('/', (req, res) => res.json({ success: true, message: 'Usuarios obtenidos.', data: list() }));
router.post('/', async (req, res) => {
  const b = req.body;
  const values = [v.text(b.nombre, 'Nombre'), v.email(b.email), await bcrypt.hash(v.password(b.password, 8), 12), v.choice(b.rol, ['Administrador','Recepción','Médico'], 'Rol'), v.text(b.area, 'Área', 80), 'ACTIVO'];
  const result = db.prepare('INSERT INTO users(nombre,email,password_hash,rol,area,estado) VALUES (?,?,?,?,?,?)').run(...values);
  res.status(201).json({ success: true, message: 'Usuario creado.', data: list().find(u => u.id === Number(result.lastInsertRowid)) });
});
router.put('/:id', (req, res) => {
  const id = v.id(req.params.id);
  if (id === req.session.user.id) v.fail(409, 'No puede desactivar su propia cuenta.');
  const state = v.choice(req.body.estado, ['ACTIVO','INACTIVO'], 'Estado');
  if (!db.prepare('UPDATE users SET estado = ? WHERE id = ?').run(state, id).changes) v.fail(404, 'Usuario no encontrado.');
  res.json({ success: true, message: 'Estado actualizado.', data: list().find(u => u.id === id) });
});
module.exports = router;
