import mongoose from "mongoose";

/**
 * Middleware central de manejo de errores.
 * Captura todos los errores lanzados con next(error) y los formatea.
 */
const errorHandler = (err, req, res, next) => {
    // 1. Errores operacionales (AppError)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            error: true,
            message: err.message,
            code: err.code,
            ...(err.details && { details: err.details })
        });
    }

    // 2. Errores de validación de Mongoose (Schema level)
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

    // 3. Errores de Cast de Mongoose (ID mal formado)
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            error: true,
            message: `Valor inválido para el campo '${err.path}': ${err.value}`,
            code: 'CAST_ERROR'
        });
    }

    // 4. Errores de duplicidad en MongoDB (Unique: true)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        return res.status(409).json({
            error: true,
            message: `Ya existe un registro con ese '${field}'`,
            code: 'DUPLICATE_KEY_ERROR'
        });
    }

    // 5. Errores de Zod (Middleware de validación)
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

    // 6. Errores de Multer (Subida de archivos)
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

    // 7. Errores desconocidos o del sistema (500)
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Logueamos el error completo solo si no es producción para no ensuciar logs o por seguridad
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