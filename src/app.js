import express from 'express';
import helmet from 'helmet';
import mongoSanitizeMiddleware from './middleware/sanitize.middleware.js';
import limiter from './middleware/rate-limit.js';
import { join } from 'node:path';
import router from './routes/index.js';
import errorHandler from './middleware/error-handler.js';

const app = express();

app.use(express.json());

app.use(helmet());

app.use(mongoSanitizeMiddleware);

app.use(limiter);

app.use('/uploads', express.static(join(import.meta.dirname, '../uploads')));

app.use('/api', router);

app.get('/', (req, res) => {
    res.json({
        message: "Bienvenido a la API",
        status: "Server Up & Running"
    });
});

app.use(errorHandler);

export default app;