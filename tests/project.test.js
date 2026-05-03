import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB, clearDB } from './db.setup.js';

beforeAll(async () => await connectDB());
afterAll(async () => await disconnectDB());
beforeEach(async () => await clearDB());

const EMAIL = 'project-test@bildyapp.com';
const PASSWORD = 'Test1234';

const setupUserWithClientAndCompany = async () => {
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

    return { token, clientId: clientRes.body.client._id };
};

describe('POST /api/project', () => {
    it('crea un proyecto', async () => {
        const { token, clientId } = await setupUserWithClientAndCompany();
        const res = await request(app).post('/api/project')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId });
        expect(res.status).toBe(201);
        expect(res.body.project.projectCode).toBe('PRJ-001');
    });

    it('devuelve 409 si el código de proyecto ya existe', async () => {
        const { token, clientId } = await setupUserWithClientAndCompany();
        await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId });
        const res = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Otro Proyecto', projectCode: 'PRJ-001', client: clientId });
        expect(res.status).toBe(409);
    });

    it('devuelve 404 si el cliente no existe', async () => {
        const { token } = await setupUserWithClientAndCompany();
        const res = await request(app).post('/api/project')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-002', client: '000000000000000000000000' });
        expect(res.status).toBe(404);
    });
});

describe('GET /api/project', () => {
    it('lista proyectos con paginación', async () => {
        const { token, clientId } = await setupUserWithClientAndCompany();
        await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId });
        const res = await request(app).get('/api/project').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.projects.length).toBe(1);
        expect(res.body).toHaveProperty('totalItems');
    });

    it('filtra por active', async () => {
        const { token, clientId } = await setupUserWithClientAndCompany();
        await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId, active: true });
        const res = await request(app).get('/api/project?active=true').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.projects.length).toBe(1);
    });
});

describe('GET /api/project/:id', () => {
    it('obtiene un proyecto por id con cliente populado', async () => {
        const { token, clientId } = await setupUserWithClientAndCompany();
        const created = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId });
        const res = await request(app).get(`/api/project/${created.body.project._id}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.project.client).toHaveProperty('name');
    });
});

describe('PUT /api/project/:id', () => {
    it('actualiza un proyecto', async () => {
        const { token, clientId } = await setupUserWithClientAndCompany();
        const created = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId });
        const res = await request(app).put(`/api/project/${created.body.project._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Nombre Actualizado' });
        expect(res.status).toBe(200);
        expect(res.body.project.name).toBe('Nombre Actualizado');
    });
});

describe('DELETE /api/project/:id + archivo y restauración', () => {
    it('archiva un proyecto con soft delete', async () => {
        const { token, clientId } = await setupUserWithClientAndCompany();
        const created = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId });
        const res = await request(app).delete(`/api/project/${created.body.project._id}?soft=true`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.project.deleted).toBe(true);
    });

    it('lista proyectos archivados', async () => {
        const { token, clientId } = await setupUserWithClientAndCompany();
        const created = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId });
        await request(app).delete(`/api/project/${created.body.project._id}?soft=true`).set('Authorization', `Bearer ${token}`);
        const res = await request(app).get('/api/project/archived').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.projects.length).toBe(1);
    });

    it('restaura un proyecto archivado', async () => {
        const { token, clientId } = await setupUserWithClientAndCompany();
        const created = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PRJ-001', client: clientId });
        await request(app).delete(`/api/project/${created.body.project._id}?soft=true`).set('Authorization', `Bearer ${token}`);
        const res = await request(app).patch(`/api/project/${created.body.project._id}/restore`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.project.deleted).toBe(false);
    });
});
