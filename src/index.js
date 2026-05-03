import { createServer } from 'node:http';
import app from './app.js';
import env from './config/env.js';
import dbConnect from './config/db.js';
import { init } from './socket.js';

dbConnect();

const httpServer = createServer(app);

init(httpServer);

httpServer.listen(env.PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${env.PORT}`);
    console.log(`Entorno: ${env.NODE_ENV}`);
});
