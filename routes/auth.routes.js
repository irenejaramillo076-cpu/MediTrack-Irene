const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../database/database');
const v = require('../utils/sanitize');
const { requireAuth } = require('../middleware/auth');
router.post('/login', async (req, res, next) => {
  try {
    const email = v.email(req.body.email);
    const password = v.password(req.body.password);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash)) || user.estado !== 'ACTIVO') v.fail(401, 'Correo o contraseña incorrectos.');
    req.session.regenerate(error => {
      if (error) return next(error);
      req.session.user = { id: user.id, nombre: user.nombre, rol: user.rol };
      req.session.save(error => error ? next(error) : res.json({ success: true, message: 'Sesión iniciada.', data: req.session.user }));
    });
  } catch (error) { next(error); }
});
router.get('/session', requireAuth, (req, res) => res.json({ success: true, message: 'Sesión activa.', data: req.session.user }));
router.post('/logout', (req, res, next) => req.session.destroy(error => {
  if (error) return next(error);
  res.clearCookie('meditrack.sid', { path: '/' });
  res.json({ success: true, message: 'Sesión cerrada.', data: null });
}));
module.exports = router;
