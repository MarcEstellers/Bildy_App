import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { tokenSign } from "../utils/handleJWT.js";
import { encrypt } from "../utils/handlePassword.js";

const generateRandomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- Registro de Usuario ---
export const registerUser = async (req, res, next) => {
    try {
        const { password, ...userData } = req.body;

        const hashedPassword = await encrypt(password);
        const verificationCode = generateRandomCode();

        const user = await User.create({
            ...userData,
            password: hashedPassword,
            verificationCode
        });

        const token = tokenSign(user);

        res.status(201).json({
            message: "Usuario creado",
            user,
            token
        });
    } catch (error) {
        next(error); // El errorHandler gestionará duplicados (email/NIF)
    }
};

// --- Validación de Email ---
export const validateEmail = async (req, res, next) => {
    try {
        const { code } = req.body;
        const userId = req.user._id;

        // 1. Descontamos el intento y traemos campos ocultos
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { verificationAttempts: -1 } },
            { new: true, select: "+verificationCode +verificationAttempts" }
        );

        if (!user) return next(AppError.notFound("Usuario"));

        // 2. Si el código coincide
        if (user.verificationCode === code) {
            user.status = "verified";
            user.verificationAttempts = 3; // Opcional: resetear intentos
            await user.save();

            return res.status(200).json({
                message: "Usuario verificado",
                user
            });
        }

        // 3. Si falló pero le quedan intentos (0 es el último intento válido)
        if (user.verificationAttempts > 0) {
            return next(AppError.badRequest(
                "Código incorrecto", 
                `Quedan ${user.verificationAttempts} intentos`
            ));
        }

        // 4. Si agotó los intentos: Borramos cuenta y lanzamos error
        await User.findByIdAndDelete(userId);
        return next(AppError.tooManyRequests(
            "Has agotado los intentos. Tu registro ha sido eliminado, por favor regístrate de nuevo."
        ));

    } catch (error) {
        next(error);
    }
};


export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Buscamos al usuario por email y pedimos explícitamente la password y el status
        const user = await User.findOne({ email }).select("+password +status");
        if (!user) {
            return next(AppError.unauthorized("Credenciales inválidas"));
        }
        // 2. Comparamos la contraseña encriptada
        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            return next(AppError.unauthorized("Credenciales inválidas"));
        }
        // 3. (Opcional) Bloquear login si no está verificado
        if (user.status !== "verified") {
            return next(AppError.forbidden("Debes verificar tu email antes de entrar"));
        }
        // 4. Generar token y responder
        const token = tokenSign(user);
        // Quitamos la password del objeto antes de enviarlo
        user.password = undefined;
        res.status(200).json({
            message: "Login exitoso",
            user,
            access_token: token
        });
    } catch (error) {
        next(error);
    }
};
// --- Obtener Perfil ---
export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('company');
        
        if (!user) return next(AppError.notFound("Usuario"));

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};