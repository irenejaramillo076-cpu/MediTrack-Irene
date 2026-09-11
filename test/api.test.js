const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'meditrack-test-'));
process.env.DB_PATH = path.join(directory,'test.db');
process.env.SESSION_DIR = directory;
process.env.SESSION_SECRET = 'test-only-secret-for-isolated-tests';
process.env.NODE_ENV = 'test';
require('../database/seed')();
const db = require('../database/database');
const { app, store } = require('../server');
const request = require('supertest');
const admin = request.agent(app);
const patient = {nombre:'Prueba',apellido:'Persistencia',identificacion:'TEST-123',fecha_nacimiento:'1990-04-12',sangre:'O+',telefono:'+507 6000-1234',correo:'test@example.test',estado:'ACTIVO'};
let patientId, appointmentId, doctorId;
test('rutas protegidas, errores y autenticación real', async () => {
  for (const route of ['patients','doctors','appointments','users','auth/session']) await request(app).get('/api/'+route).expect(401);
  await request(app).post('/api/auth/login').send({email:'admin@meditrack.test',password:'incorrecta'}).expect(401);
  const login = await admin.post('/api/auth/login').send({email:'admin@meditrack.test',password:'Admin123*',role:'medico'}).expect(200);
  assert.equal(login.body.data.rol,'Administrador');
  assert.match(login.headers['set-cookie'][0], /HttpOnly/);
  await admin.get('/api/auth/session').expect(200);
  await admin.get('/api/patients/no-id').expect(400);
  await admin.get('/api/patients/999999').expect(404);
  await admin.get('/api/no-existe').expect(404);
  await admin.post('/api/patients').set('Origin','https://externo.test').send(patient).expect(403);
  await admin.post('/api/patients').set('Content-Type','application/json').send('{').expect(400);
  const users = await admin.get('/api/users').expect(200);
  assert.ok(users.body.data.every(u => !('password_hash' in u)));
  const hash = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(1).password_hash;
  assert.match(hash,/^\$2/);
});
test('CRUD pacientes, validación, sanitización y consultas parametrizadas', async () => {
  const response = await admin.post('/api/patients').send({...patient,nombre:'<b>Prueba</b><script>alert(1)</script>'}).expect(201);
  patientId = response.body.data.id;
  assert.equal(response.body.data.nombre,'Prueba');
  await admin.post('/api/patients').send(patient).expect(409);
  await admin.post('/api/patients').send({...patient,identificacion:'BAD',fecha_nacimiento:'2026-02-30'}).expect(400);
  await admin.post('/api/patients').send({...patient,correo:'incorrecto'}).expect(400);
  await admin.put('/api/patients/'+patientId).send({...patient,apellido:"O'Connor",nombre:"Robert'); DROP TABLE users;--"}).expect(200);
  const updated = await admin.get('/api/patients/'+patientId).expect(200);
  assert.equal(updated.body.data.apellido,"O'Connor");
  await admin.get('/api/users').expect(200);
  const list = await admin.get('/api/patients').expect(200);
  assert.ok(list.body.data.some(p=>p.id===patientId));
});
test('CRUD médicos y citas; horario único; integridad referencial', async () => {
  const doctor = {nombre:'Dra. Prueba',especialidad:'General',registro:'TEST-MED',turno:'08:00–16:00',estado:'DISPONIBLE'};
  doctorId = (await admin.post('/api/doctors').send(doctor).expect(201)).body.data.id;
  await admin.post('/api/doctors').send(doctor).expect(409);
  await admin.put('/api/doctors/'+doctorId).send({...doctor,nombre:'Dra. Editada'}).expect(200);
  await admin.get('/api/doctors/'+doctorId).expect(200);
  const appointment = {patient_id:patientId,doctor_id:doctorId,especialidad:'General',fecha:'2026-10-01',hora:'10:30',estado:'PROGRAMADA'};
  appointmentId = (await admin.post('/api/appointments').send(appointment).expect(201)).body.data.id;
  await admin.post('/api/appointments').send(appointment).expect(409);
  await admin.put('/api/appointments/'+appointmentId).send({...appointment,hora:'11:00'}).expect(200);
  assert.equal((await admin.get('/api/appointments/'+appointmentId)).body.data.hora,'11:00');
  await admin.delete('/api/patients/'+patientId).expect(409);
  await admin.delete('/api/doctors/'+doctorId).expect(409);
  const parallel = await Promise.all([admin.post('/api/appointments').send(appointment),admin.post('/api/appointments').send(appointment)]);
  assert.deepEqual(parallel.map(r=>r.status).sort(),[201,409]);
  await admin.delete('/api/appointments/'+parallel.find(r=>r.status===201).body.data.id).expect(200);
});
test('roles y administración persistida', async () => {
  for (const [email,password] of [['recepcion@meditrack.test','Recepcion123*'],['medico@meditrack.test','Medico123*']]) {
    const agent=request.agent(app);
    await agent.post('/api/auth/login').send({email,password}).expect(200);
    await agent.get('/api/patients').expect(200);
    await agent.get('/api/users').expect(403);
    await agent.post('/api/users').send({}).expect(403);
  }
  const user = (await admin.post('/api/users').send({nombre:'Nueva',email:'nueva@example.test',password:'Segura123*',rol:'Recepción',area:'Admisión'}).expect(201)).body.data;
  const agent=request.agent(app);
  await agent.post('/api/auth/login').send({email:user.email,password:'Segura123*'}).expect(200);
  await admin.put('/api/users/'+user.id).send({estado:'INACTIVO'}).expect(200);
  await agent.get('/api/patients').expect(401);
  await admin.put('/api/users/1').send({estado:'INACTIVO'}).expect(409);
});
async function startServer() {
  const server = spawn(process.execPath,['-e',"const {app}=require('./server'); const s=app.listen(0,()=>console.log('PORT:'+s.address().port));"],{cwd:path.join(__dirname,'..'),env:process.env,stdio:['ignore','pipe','pipe'],windowsHide:true});
  const port = await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Servidor no inició')),10000);server.stdout.on('data',chunk=>{const m=String(chunk).match(/PORT:(\d+)/);if(m){clearTimeout(timer);resolve(Number(m[1]));}});server.once('error',reject);});
  return {server,url:'http://127.0.0.1:'+port};
}
async function stop(server) { const ended=new Promise(resolve=>server.once('exit',resolve));server.kill();await ended; }
test('datos y sesión sobreviven al reinicio real del proceso Node', async () => {
  let running=await startServer();
  let cookie;
  try {
    const login=await fetch(running.url+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@meditrack.test',password:'Admin123*'})});
    cookie=login.headers.get('set-cookie').split(';')[0];
    assert.equal(login.status,200);
  } finally {await stop(running.server);}
  running=await startServer();
  try {
    for(const route of ['auth/session','patients/'+patientId,'appointments/'+appointmentId,'doctors/'+doctorId]) assert.equal((await fetch(running.url+'/api/'+route,{headers:{Cookie:cookie}})).status,200);
  } finally {await stop(running.server);}
});
test('eliminación definitiva y logout invalidan acceso', async () => {
  await admin.delete('/api/appointments/'+appointmentId).expect(200);
  await admin.delete('/api/patients/'+patientId).expect(200);
  await admin.delete('/api/doctors/'+doctorId).expect(200);
  await admin.get('/api/patients/'+patientId).expect(404);
  await admin.post('/api/auth/logout').expect(200);
  await admin.get('/api/auth/session').expect(401);
  await admin.get('/api/patients').expect(401);
});
after(async()=>{ await new Promise(resolve=>store.db.close(resolve)); db.close(); fs.rmSync(directory,{recursive:true,force:true}); });
