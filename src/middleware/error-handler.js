import mongoose from 'mongoose';

const errorHandler = (err, req, res, next) => {
    // 1. Errores operacionales (AppError personalizados)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            error: true,
            code: err.code || 'OPERATIONAL_ERROR',
            message: err.message,
            ...(err.details && { details: err.details })
        });
    }

    // 2. Errores de Validación (Zod o Mongoose)
    // Manejo de Zod
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: true,
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    }

    // Manejo de Mongoose ValidationError
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            error: true,
            code: 'DB_VALIDATION_ERROR',
            message: 'Error de validación en base de datos',
            details: Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // 3. Errores de Base de Datos (Duplicates y Cast)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        return res.status(409).json({
            error: true,
            code: 'DUPLICATE_KEY',
            message: `Ya existe un registro con ese '${field}'`
        });
    }

    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            error: true,
            code: 'CAST_ERROR',
            message: `El formato del campo '${err.path}' es inválido`
        });
    }

    // 4. Errores de Carga de Archivos (Multer)
    const multerErrors = {
        'LIMIT_FILE_SIZE': { message: 'Archivo muy grande', code: 'FILE_TOO_LARGE' },
        'LIMIT_FILE_COUNT': { message: 'Demasiados archivos', code: 'TOO_MANY_FILES' }
    };

    if (multerErrors[err.code]) {
        return res.status(400).json({
            error: true,
            code: multerErrors[err.code].code,
            message: multerErrors[err.code].message
        });
    }

    // 5. Error por Defecto (500 Internal Server Error)
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Logueamos el error solo si no es operacional para debuguear en el servidor
    if (!isProduction) console.error('ERROR:', err);

    return res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: isProduction ? 'Error interno del servidor' : err.message,
        ...(!isProduction && { stack: err.stack })
    });
};

export default errorHandler;