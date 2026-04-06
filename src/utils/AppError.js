export class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);

        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
    }

    static badRequest(message, details) {
        const error = new AppError(400, message, details);
        return error;
    }
    static notFound(message = 'Recurso no encontrado') {
        const error = new AppError(404, message);
        return error;
    }
    static tooManyRequests(message = 'Agotado el numero de intentos') {
        const error = new AppError(409, message);
        return error;
    }
    static internal(message = 'Error interno del servidor') {
        const error = new AppError(500, message);
        return error;
    }
}