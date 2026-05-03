import { verifyAccessToken } from "../utils/handleJWT.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/User.js";

const extractBearerToken = (authorizationHeader) => {
    if (!authorizationHeader) return null;

    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token) return null;

    return token;
};

export const validateUser = async (req, res, next) => {
    try {
        const token = extractBearerToken(req.headers.authorization);

        if (!token) {
            return next(AppError.unauthorized("No se proporcionó un token de autenticación"));
        }

        const payload = verifyAccessToken(token);

        const user = await User.findById(payload._id);

        if (!user) {
            return next(AppError.unauthorized("El usuario ya no existe en el sistema"));
        }

        if (user.deleted) {
            return next(AppError.unauthorized("Esta cuenta ha sido desactivada"));
        }

        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        next(error);
    }
};
