import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware de validación universal usando Zod.
 * Valida body, query y params simultáneamente según el esquema proporcionado.
 */
const validate = (schema) => async (req, res, next) => {
    try {
        // parseAsync permite validaciones que requieran DB (si las tuvieras)
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params
        });
        
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            // Mapeamos los errores de Zod a un formato amigable para el frontend
            const details = error.issues.map(err => ({
                field: err.path.join('.').replace('body.', '').replace('query.', '').replace('params.', ''),
                message: err.message
            }));

            // Enviamos el error al Global Error Handler mediante next()
            return next(AppError.badRequest('Error de validación en los datos de entrada', details));
        }
        
        // Si es un error desconocido, también lo pasamos al siguiente middleware
        next(error);
    }
};

export default validate;