import { ZodError } from 'zod';
import { ApiError } from './errorHandler.js';

export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((issue) => {
                    return {
                        campo: issue.path.join('.'),
                        mensaje: issue.message
                    };
                });

                return ApiError.badRequest('Error de validación', errors);
            }

            next(error);
        }
    };
};