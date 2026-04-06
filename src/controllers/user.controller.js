import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { tokenSign } from "../utils/handleJWT.js";
import { encrypt } from "../utils/handlePassword.js";

// Generador de código de 6 dígitos más limpio
const generateRandomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerUser = async (req, res, next) => {
    try {
        const { password, ...userData } = req.body;

        // 1. Encriptar contraseña y generar código
        const hashedPassword = await encrypt(password);
        const verificationCode = generateRandomCode();

        // 2. Crear usuario
        const user = await User.create({
            ...userData,
            password: hashedPassword,
            verificationCode
        });

        // 3. Generar JWT
        const token = tokenSign(user);

        // 4. Respuesta (No enviamos el password de vuelta)
        res.status(201).json({
            message: "Usuario creado con éxito",
            user,
            token
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) return next(AppError.notFound("Usuario no encontrado"));

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const validateEmail = async (req, res, next) => {
    try {
        const { code } = req.body;
        const userId = req.user._id;

        // Actualizamos y obtenemos el documento NUEVO para tener el contador real
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { verificationAttempts: -1 } },
            { new: true, select: "+verificationCode +verificationAttempts" }
        );

        if (!user) return next(AppError.notFound("Usuario no encontrado"));

        // 1. Validar si ya no tiene intentos
        if (user.verificationAttempts < 0) {
            return next(AppError.tooManyRequests("Has superado el límite de intentos"));
        }

        // 2. Validar el código
        if (user.verificationCode === code) {
            // Si es correcto, marcamos como verificado y reseteamos intentos
            user.status = "verified";
            user.verificationAttempts = 3;
            await user.save();

            return res.status(200).json({ message: "Email verificado correctamente" });
        }

        // 3. Código incorrecto
        return next(AppError.badRequest(
            "Código incorrecto", 
            `Te quedan ${user.verificationAttempts} intentos`
        ));

    } catch (error) {
        next(error);
    }
};