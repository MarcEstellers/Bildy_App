import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params
        });

        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const details = error.issues.map(err => ({
                field: err.path.join('.').replace('body.', '').replace('query.', '').replace('params.', ''),
                message: err.message
            }));

            return next(AppError.badRequest('Error de validación en los datos de entrada', details));
        }

        next(error);
    }
};

export default validate;
