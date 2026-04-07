import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import env from '../config/env.js';
import { AppError } from './AppError.js';

const JWT_SECRET = env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_DAYS = 7;

//Genera un Access Token (JWT) de corta duración
export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES }
    );
};

//Genera un Refresh Token aleatorio y seguro (Opaco)
export const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

// Calcula la fecha de expiración para el Refresh Token
export const getRefreshTokenExpiry = () => {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + REFRESH_TOKEN_DAYS);
    return expireDate;
};

//Verifica un Access Token y retorna el payload o lanza un AppError

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw AppError.unauthorized('El token ha expirado', 'TOKEN_EXPIRED');
        }
        if (error.name === 'JsonWebTokenError') {
            throw AppError.unauthorized('Token inválido', 'INVALID_TOKEN');
        }
        throw error;
    }
};