import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB, clearDB } from './db.setup.js';

beforeAll(async () => await connectDB());
afterAll(async () => await disconnectDB());
beforeEach(async () => await clearDB());

const EMAIL = 'test@bildyapp.com';
const PASSWORD = 'Test1234';

const registerAndVerify = async () => {
    const reg = await request(app).post('/api/user/register').send({ email: EMAIL, password: PASSWORD });
    const { access_token, code_debug } = reg.body;
    await request(app).put('/api/user/validation')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ code: code_debug });
    return access_token;
};

const loginAndGetToken = async () => {
    await registerAndVerify();
    const res = await request(app).post('/api/user/login').send({ email: EMAIL, password: PASSWORD });
    return res.body.access_token;
};

describe('POST /api/user/register', () => {
    it('registra un usuario nuevo', async () => {
        const res = await request(app).post('/api/user/register').send({ email: EMAIL, password: PASSWORD });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('code_debug');
    });

    it('devuelve 400 si el email es inválido', async () => {
        const res = await request(app).post('/api/user/register').send({ email: 'no-es-email', password: PASSWORD });
        expect(res.status).toBe(400);
    });

    it('devuelve 400 si la contraseña es muy corta', async () => {
        const res = await request(app).post('/api/user/register').send({ email: EMAIL, password: '123' });
        expect(res.status).toBe(400);
    });
});

describe('PUT /api/user/validation', () => {
    it('verifica el email con código correcto', async () => {
        const reg = await request(app).post('/api/user/register').send({ email: EMAIL, password: PASSWORD });
        const { access_token, code_debug } = reg.body;
        const res = await request(app).put('/api/user/validation')
            .set('Authorization', `Bearer ${access_token}`)
            .send({ code: code_debug });
        expect(res.status).toBe(200);
    });

    it('devuelve 400 con código incorrecto', async () => {
        const reg = await request(app).post('/api/user/register').send({ email: EMAIL, password: PASSWORD });
        const res = await request(app).put('/api/user/validation')
            .set('Authorization', `Bearer ${reg.body.access_token}`)
            .send({ code: '000000' });
        expect(res.status).toBe(400);
    });
});

describe('POST /api/user/login', () => {
    it('hace login correctamente', async () => {
        await registerAndVerify();
        const res = await request(app).post('/api/user/login').send({ email: EMAIL, password: PASSWORD });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('refresh_token');
    });

    it('devuelve 401 con contraseña incorrecta', async () => {
        await registerAndVerify();
        const res = await request(app).post('/api/user/login').send({ email: EMAIL, password: 'WrongPass1' });
        expect(res.status).toBe(401);
    });

    it('devuelve 403 si el email no está verificado', async () => {
        await request(app).post('/api/user/register').send({ email: EMAIL, password: PASSWORD });
        const res = await request(app).post('/api/user/login').send({ email: EMAIL, password: PASSWORD });
        expect(res.status).toBe(403);
    });
});

describe('GET /api/user', () => {
    it('devuelve el usuario autenticado', async () => {
        const token = await loginAndGetToken();
        const res = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(EMAIL);
    });

    it('devuelve 401 sin token', async () => {
        const res = await request(app).get('/api/user');
        expect(res.status).toBe(401);
    });
});

describe('PUT /api/user/register', () => {
    it('actualiza el perfil del usuario', async () => {
        const token = await loginAndGetToken();
        const res = await request(app).put('/api/user/register')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Marc', lastName: 'Estellers', nif: '12345678A' });
        expect(res.status).toBe(200);
        expect(res.body.user.name).toBe('Marc');
    });
});

describe('PATCH /api/user/company', () => {
    it('crea una compañía freelance', async () => {
        const token = await loginAndGetToken();
        await request(app).put('/api/user/register')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Marc', lastName: 'Estellers', nif: '12345678A' });
        const res = await request(app).patch('/api/user/company')
            .set('Authorization', `Bearer ${token}`)
            .send({ isFreelance: true });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('company');
    });

    it('crea una compañía normal', async () => {
        const token = await loginAndGetToken();
        const res = await request(app).patch('/api/user/company')
            .set('Authorization', `Bearer ${token}`)
            .send({ isFreelance: false, name: 'Mi Empresa SL', cif: 'B12345678', address: { street: 'Calle Mayor', number: '1', postal: '08001', city: 'Barcelona', province: 'Barcelona' } });
        expect(res.status).toBe(201);
    });
});

describe('POST /api/user/refresh', () => {
    it('renueva el access token', async () => {
        await registerAndVerify();
        const login = await request(app).post('/api/user/login').send({ email: EMAIL, password: PASSWORD });
        const res = await request(app).post('/api/user/refresh')
            .send({ refreshToken: login.body.refresh_token });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('access_token');
    });
});

describe('POST /api/user/logout', () => {
    it('cierra la sesión', async () => {
        const token = await loginAndGetToken();
        const res = await request(app).post('/api/user/logout').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });
});

describe('PUT /api/user/password', () => {
    it('cambia la contraseña', async () => {
        const token = await loginAndGetToken();
        const res = await request(app).put('/api/user/password')
            .set('Authorization', `Bearer ${token}`)
            .send({ currentPassword: PASSWORD, newPassword: 'NewPass1234' });
        expect(res.status).toBe(200);
    });

    it('devuelve 401 si la contraseña actual es incorrecta', async () => {
        const token = await loginAndGetToken();
        const res = await request(app).put('/api/user/password')
            .set('Authorization', `Bearer ${token}`)
            .send({ currentPassword: 'WrongPass1', newPassword: 'NewPass1234' });
        expect(res.status).toBe(401);
    });
});
