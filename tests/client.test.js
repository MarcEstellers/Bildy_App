import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB, clearDB } from './db.setup.js';

beforeAll(async () => await connectDB());
afterAll(async () => await disconnectDB());
beforeEach(async () => await clearDB());

const EMAIL = 'client-test@bildyapp.com';
const PASSWORD = 'Test1234';

const getTokenWithCompany = async () => {
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

    return token;
};

const CLIENT_DATA = { name: 'Cliente Test', cif: 'B98765432', email: 'cliente@test.com', phone: '600000000' };

describe('POST /api/client', () => {
    it('crea un cliente', async () => {
        const token = await getTokenWithCompany();
        const res = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        expect(res.status).toBe(201);
        expect(res.body.client.name).toBe(CLIENT_DATA.name);
    });

    it('devuelve 409 si el CIF ya existe en la compañía', async () => {
        const token = await getTokenWithCompany();
        await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        const res = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        expect(res.status).toBe(409);
    });

    it('devuelve 400 si faltan campos obligatorios', async () => {
        const token = await getTokenWithCompany();
        const res = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ email: 'solo@email.com' });
        expect(res.status).toBe(400);
    });
});

describe('GET /api/client', () => {
    it('lista los clientes con paginación', async () => {
        const token = await getTokenWithCompany();
        await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        const res = await request(app).get('/api/client').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('clients');
        expect(res.body).toHaveProperty('totalItems');
        expect(res.body.clients.length).toBe(1);
    });

    it('filtra por nombre', async () => {
        const token = await getTokenWithCompany();
        await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        const res = await request(app).get('/api/client?name=Cliente').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.clients.length).toBe(1);
    });
});

describe('GET /api/client/:id', () => {
    it('obtiene un cliente por id', async () => {
        const token = await getTokenWithCompany();
        const created = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        const res = await request(app).get(`/api/client/${created.body.client._id}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.client._id).toBe(created.body.client._id);
    });

    it('devuelve 404 si no existe', async () => {
        const token = await getTokenWithCompany();
        const res = await request(app).get('/api/client/000000000000000000000000').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
    });
});

describe('PUT /api/client/:id', () => {
    it('actualiza un cliente', async () => {
        const token = await getTokenWithCompany();
        const created = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        const res = await request(app).put(`/api/client/${created.body.client._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Nombre Actualizado' });
        expect(res.status).toBe(200);
        expect(res.body.client.name).toBe('Nombre Actualizado');
    });
});

describe('DELETE /api/client/:id', () => {
    it('archiva un cliente con soft delete', async () => {
        const token = await getTokenWithCompany();
        const created = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        const res = await request(app).delete(`/api/client/${created.body.client._id}?soft=true`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.client.deleted).toBe(true);
    });

    it('elimina físicamente un cliente', async () => {
        const token = await getTokenWithCompany();
        const created = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        const res = await request(app).delete(`/api/client/${created.body.client._id}?soft=false`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });
});

describe('GET /api/client/archived', () => {
    it('lista los clientes archivados', async () => {
        const token = await getTokenWithCompany();
        const created = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        await request(app).delete(`/api/client/${created.body.client._id}?soft=true`).set('Authorization', `Bearer ${token}`);
        const res = await request(app).get('/api/client/archived').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.clients.length).toBe(1);
    });
});

describe('PATCH /api/client/:id/restore', () => {
    it('restaura un cliente archivado', async () => {
        const token = await getTokenWithCompany();
        const created = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send(CLIENT_DATA);
        await request(app).delete(`/api/client/${created.body.client._id}?soft=true`).set('Authorization', `Bearer ${token}`);
        const res = await request(app).patch(`/api/client/${created.body.client._id}/restore`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.client.deleted).toBe(false);
    });
});
