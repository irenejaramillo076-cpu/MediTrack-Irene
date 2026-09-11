require('dotenv').config({ quiet: true });
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
const app = express();
const production = process.env.NODE_ENV === 'production';
let secret = process.env.SESSION_SECRET;
if (!secret || secret === 'cambiar_esta_clave') {
  if (production) throw new Error('Configure SESSION_SECRET para producción.');
  const envFile = path.join(__dirname, '.env');
  secret = crypto.randomBytes(48).toString('hex');
  // Secreto persistente.
  fs.appendFileSync(envFile, `\nSESSION_SECRET=${secret}\n`);
}
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': production ? [] : null } } }));
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (process.env.NODE_ENV === 'development') console.log(`[${req.method}] /api${req.path}`);
  // Validación de origen.
  const origin = req.get('origin');
  if (!['GET','HEAD','OPTIONS'].includes(req.method) && (req.get('sec-fetch-site') === 'cross-site' || (origin && origin !== `${req.protocol}://${req.get('host')}`))) return res.status(403).json({ success: false, message: 'Origen no permitido.', data: null });
  if (['POST','PUT'].includes(req.method)) {
    if (req.body === undefined) req.body = {};
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ success: false, message: 'Se requiere un objeto de datos.', data: null });
  }
  next();
});
const sessionDir = process.env.SESSION_DIR || path.join(__dirname, 'database');
fs.mkdirSync(sessionDir, { recursive: true });
const store = new SQLiteStore({ db: 'sessions.sqlite', dir: sessionDir });
app.use(session({ name: 'meditrack.sid', secret, store, resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: 'lax', secure: production, maxAge: 8 * 60 * 60 * 1000 } }));
for (const route of ['auth','patients','appointments','doctors','users']) app.use(`/api/${route}`, require(`./routes/${route}.routes`));
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Ruta no encontrada.', data: null }));
app.get('/js/jquery.min.js', (req, res) => res.sendFile(require.resolve('jquery/dist/jquery.min.js')));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.status(404).json({ success: false, message: 'Recurso no encontrado.', data: null }));
app.use((err, req, res, next) => {
  let status = err.status || 500, message = err.status ? err.message : 'Error interno del servidor.';
  if (String(err.message).includes('UNIQUE constraint')) { status = 409; message = 'Ya existe ese identificador, registro o horario.'; }
  if (String(err.message).includes('FOREIGN KEY constraint')) { status = 409; message = 'Tiene citas asociadas. Elimine primero esas citas.'; }
  if (err.type === 'entity.parse.failed') { status = 400; message = 'JSON inválido.'; }
  if (status === 500 && process.env.NODE_ENV === 'development') console.error(err);
  res.status(status).json({ success: false, message, data: null });
});
if (require.main === module) {
  const server = app.listen(process.env.PORT || 3000, () => console.log(`MediTrack 360: http://localhost:${process.env.PORT || 3000}`));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}
module.exports = { app, store };
