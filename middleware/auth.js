const db = require('../database/database');
function requireAuth(req, res, next) {
  const user = req.session.user && db.prepare('SELECT id, nombre, rol, estado FROM users WHERE id = ?').get(req.session.user.id);
  if (!user || user.estado !== 'ACTIVO') return res.status(401).json({ success: false, message: 'Inicie sesión para continuar.', data: null });
  req.session.user = { id: user.id, nombre: user.nombre, rol: user.rol };
  next();
}
function requireAdmin(req, res, next) {
  if (req.session.user.rol !== 'Administrador') return res.status(403).json({ success: false, message: 'Solo Administrador.', data: null });
  next();
}
module.exports = { requireAuth, requireAdmin };
