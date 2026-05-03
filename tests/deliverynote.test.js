import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB, clearDB } from './db.setup.js';

beforeAll(async () => await connectDB());
afterAll(async () => await disconnectDB());
beforeEach(async () => await clearDB());

const EMAIL = 'dn-test@bildyapp.com';
const PASSWORD = 'Test1234';

const setupFull = async () => {
    const reg = await request(app).post('/api/user/register').send({ email: EMAIL, password: PASSWORD });
    const { access_token, code_debug } = reg.body;
    await request(app).put('/api/user/validation')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ code: code_debug });
    const login = await request(app).post('/api/user/login').send({ email: EMAIL, password: PASSWORD });
    const token = login.body.access_token;

    await request(app).put('/api/user/register')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Marc', lastName: 'Test', nif: '12345678A' });

    await request(app).patch('/api/user/company')
        .set('Authorization', `Bearer ${token}`)
        .send({ isFreelance: false, name: 'Test Company SL', cif: 'B12345678', address: { street: 'Calle', number: '1', postal: '08001', city: 'BCN', province: 'BCN' } });

    const clientRes = await request(app).post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cliente Test', cif: 'B98765432' });

    const projectRes = await request(app).post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientRes.body.client._id });

    return { token, projectId: projectRes.body.project._id };
};

describe('POST /api/deliverynote', () => {
    it('crea un albarán de horas', async () => {
        const { token, projectId } = await setupFull();
        const res = await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: projectId, format: 'hours', workDate: '2025-06-01', hours: 8, description: 'Trabajo del día' });
        expect(res.status).toBe(201);
        expect(res.body.deliveryNote.format).toBe('hours');
    });

    it('crea un albarán de material', async () => {
        const { token, projectId } = await setupFull();
        const res = await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: projectId, format: 'material', workDate: '2025-06-01', material: 'Cemento', quantity: 10, unit: 'sacos' });
        expect(res.status).toBe(201);
        expect(res.body.deliveryNote.format).toBe('material');
    });

    it('crea un albarán con múltiples trabajadores', async () => {
        const { token, projectId } = await setupFull();
        const res = await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: projectId, format: 'hours', workDate: '2025-06-01', workers: [{ name: 'Juan', hours: 8 }, { name: 'Ana', hours: 6 }] });
        expect(res.status).toBe(201);
        expect(res.body.deliveryNote.workers.length).toBe(2);
    });

    it('devuelve 400 si falta el formato', async () => {
        const { token, projectId } = await setupFull();
        const res = await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: projectId, workDate: '2025-06-01' });
        expect(res.status).toBe(400);
    });

    it('devuelve 404 si el proyecto no existe', async () => {
        const { token } = await setupFull();
        const res = await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: '000000000000000000000000', format: 'hours', workDate: '2025-06-01', hours: 8 });
        expect(res.status).toBe(404);
    });
});

describe('GET /api/deliverynote', () => {
    it('lista albaranes con paginación', async () => {
        const { token, projectId } = await setupFull();
        await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: projectId, format: 'hours', workDate: '2025-06-01', hours: 8 });
        const res = await request(app).get('/api/deliverynote').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.deliveryNotes.length).toBe(1);
        expect(res.body).toHaveProperty('totalItems');
    });

    it('filtra por formato', async () => {
        const { token, projectId } = await setupFull();
        await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: projectId, format: 'hours', workDate: '2025-06-01', hours: 8 });
        const res = await request(app).get('/api/deliverynote?format=hours').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.deliveryNotes[0].format).toBe('hours');
    });
});

describe('GET /api/deliverynote/:id', () => {
    it('obtiene un albarán con populate completo', async () => {
        const { token, projectId } = await setupFull();
        const created = await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: projectId, format: 'hours', workDate: '2025-06-01', hours: 8 });
        const res = await request(app).get(`/api/deliverynote/${created.body.deliveryNote._id}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.deliveryNote).toHaveProperty('client');
        expect(res.body.deliveryNote).toHaveProperty('project');
    });
});

describe('DELETE /api/deliverynote/:id', () => {
    it('elimina un albarán no firmado', async () => {
        const { token, projectId } = await setupFull();
        const created = await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: projectId, format: 'hours', workDate: '2025-06-01', hours: 8 });
        const res = await request(app).delete(`/api/deliverynote/${created.body.deliveryNote._id}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    it('devuelve 404 al intentar eliminar uno ya eliminado', async () => {
        const { token, projectId } = await setupFull();
        const created = await request(app).post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({ project: projectId, format: 'hours', workDate: '2025-06-01', hours: 8 });
        await request(app).delete(`/api/deliverynote/${created.body.deliveryNote._id}`).set('Authorization', `Bearer ${token}`);
        const res = await request(app).delete(`/api/deliverynote/${created.body.deliveryNote._id}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
    });
});
