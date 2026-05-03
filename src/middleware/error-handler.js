import mongoose from "mongoose";

const errorHandler = (err, req, res, next) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code,
            ...(err.details && { details: err.details })
        });
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const details = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(400).json({
            error: true,
            message: 'Error de validación en la base de datos',
            code: 'DB_VALIDATION_ERROR',
            details
        });
    }

    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            error: true,
            message: `Valor inválido para el campo '${err.path}': ${err.value}`,
            code: 'CAST_ERROR'
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        return res.status(409).json({
            error: true,
            message: `Ya existe un registro con ese '${field}'`,
            code: 'DUPLICATE_KEY_ERROR'
        });
    }

    if (err.name === 'ZodError') {
        const details = err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));
        return res.status(400).json({
            error: true,
            message: 'Datos de entrada incorrectos',
            code: 'VALIDATION_ERROR',
            details
        });
    }

    const multerErrors = {
        'LIMIT_FILE_SIZE': { message: 'El archivo es demasiado grande', code: 'FILE_TOO_LARGE' },
        'LIMIT_FILE_COUNT': { message: 'Has subido demasiados archivos', code: 'TOO_MANY_FILES' },
        'LIMIT_UNEXPECTED_FILE': { message: 'Campo de archivo no esperado', code: 'UNEXPECTED_FILE' }
    };

    if (multerErrors[err.code]) {
        return res.status(400).json({
            error: true,
            ...multerErrors[err.code]
        });
    }

    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
        console.error("INTERNAL_ERROR:", err);
    }

    res.status(500).json({
        error: true,
        message: isProduction ? 'Ha ocurrido un error inesperado en el servidor' : err.message,
        code: 'INTERNAL_SERVER_ERROR',
        ...(!isProduction && { stack: err.stack })
    });
};

export default errorHandler;
