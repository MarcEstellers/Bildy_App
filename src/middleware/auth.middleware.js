import { verifyAccessToken } from "../utils/handleJWT.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/User.js";

/**
 * Extrae el token del header Authorization: Bearer <token>
 */
const extractBearerToken = (authorizationHeader) => {
    if (!authorizationHeader) return null;
    
    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token) return null;

    return token;
};

/**
 * Middleware para validar el Access Token y cargar al usuario en la request
 */
export const validateUser = async (req, res, next) => {
    try {
        const token = extractBearerToken(req.headers.authorization);

        if (!token) {
            return next(AppError.unauthorized("No se proporcionó un token de autenticación"));
        }

        // 1. Verificamos el token (esto lanzará AppError si ha expirado o es inválido)
        const payload = verifyAccessToken(token);

        // 2. Buscamos al usuario en la BD (incluyendo si está borrado por el plugin)
        const user = await User.findById(payload._id);

        if (!user) {
            return next(AppError.unauthorized("El usuario ya no existe en el sistema"));
        }

        // 3. Verificamos si el usuario está marcado como borrado (Soft Delete)
        if (user.deleted) {
            return next(AppError.unauthorized("Esta cuenta ha sido desactivada"));
        }

        // 4. Inyectamos los datos en la request para los siguientes middlewares/controladores
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        // Si verifyAccessToken lanza un error, cae aquí y lo enviamos al error handler
        next(error);
    }
};