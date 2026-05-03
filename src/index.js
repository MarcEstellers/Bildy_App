import { createServer } from 'node:http';
import mongoose from 'mongoose';
import app from './app.js';
import env from './config/env.js';
import dbConnect from './config/db.js';
import { init } from './socket.js';

dbConnect();

const httpServer = createServer(app);
const io = init(httpServer);

httpServer.listen(env.PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${env.PORT}`);
    console.log(`Entorno: ${env.NODE_ENV}`);
});

const shutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando servidor...`);
    httpServer.close(async () => {
        io.close();
        await mongoose.connection.close();
        console.log('Servidor cerrado correctamente');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
