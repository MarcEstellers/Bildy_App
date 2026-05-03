export class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = 'Solicitud inválida', details = null, code = 'BAD_REQUEST') {
        return new AppError(message, 400, code, details);
    }

    static unauthorized(message = 'No autorizado', details = null, code = 'UNAUTHORIZED') {
        return new AppError(message, 401, code, details);
    }

    static forbidden(message = 'Acceso prohibido', details = null, code = 'FORBIDDEN') {
        return new AppError(message, 403, code, details);
    }

    static notFound(resource = 'Recurso', details = null, code = 'NOT_FOUND') {
        return new AppError(`${resource} no encontrado/a`, 404, code, details);
    }

    static conflict(message = 'Conflicto con el recurso', details = null, code = 'CONFLICT') {
        return new AppError(message, 409, code, details);
    }

    static validation(message = 'Error de validación', details = [], code = 'VALIDATION_ERROR') {
        return new AppError(message, 400, code, details);
    }

    static tooManyRequests(message = 'Demasiados intentos', details = null, code = 'TOO_MANY_REQUESTS') {
        return new AppError(message, 429, code, details);
    }

    static internal(message = 'Error interno del servidor', details = null, code = 'INTERNAL_ERROR') {
        return new AppError(message, 500, code, details);
    }
}
