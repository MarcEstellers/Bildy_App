import { Server } from 'socket.io';
import { verifyAccessToken } from './utils/handleJWT.js';

let io;

export const init = (httpServer) => {
    io = new Server(httpServer, {
        cors: { origin: '*' }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Token no proporcionado'));

        try {
            const payload = verifyAccessToken(token);
            socket.user = payload;
            next();
        } catch {
            next(new Error('Token inválido'));
        }
    });

    io.on('connection', (socket) => {
        const companyId = socket.handshake.auth?.companyId;
        if (companyId) {
            socket.join(`company:${companyId}`);
        }

        socket.on('disconnect', () => {});
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        if (process.env.NODE_ENV === 'test') {
            return { to: () => ({ emit: () => {} }) };
        }
        throw new Error('Socket.IO no inicializado');
    }
    return io;
};
