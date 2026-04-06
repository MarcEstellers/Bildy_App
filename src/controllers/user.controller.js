import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import { AppError } from "../utils/AppError.js";
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from "../utils/handleJWT.js";
import { compare, encrypt } from "../utils/handlePassword.js";

const generateRandomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- Registro Inicial ---
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

        const token = generateAccessToken(user);
        const refreshTokenDoc = await RefreshToken.create({
            token: generateRefreshToken(),
            user: user._id,
            expiresAt: getRefreshTokenExpiry(),
            createdByIp: req.ip
        });

        res.status(201).json({
            message: "Usuario creado",
            user,
            access_token: token,
            refresh_token: refreshTokenDoc.token
        });
    } catch (error) {
        next(error);
    }
};

// --- Validación de Email ---
export const validateEmail = async (req, res, next) => {
    try {
        const { code } = req.body;
        const id = req.user._id;

        const user = await User.findByIdAndUpdate(
            id, 
            { $inc: { verificationAttempts: -1 } }, 
            { new: true }
        ).select('+verificationCode +verificationAttempts +status');

        if (!user) return next(AppError.notFound("Usuario"));
        if (user.status === "verified") return next(AppError.badRequest("Email ya verificado"));

        if (user.verificationCode === code) {
            user.status = "verified";
            user.verificationAttempts = 3;
            await user.save();
            return res.json({ message: "Usuario verificado", user });
        }

        if (user.verificationAttempts > 0) {
            return next(AppError.badRequest("Código incorrecto", `Quedan ${user.verificationAttempts} intentos`));
        }

        await User.findByIdAndDelete(id);
        await RefreshToken.deleteMany({ user: id });
        return next(AppError.tooManyRequests("Intentos agotados. Registro eliminado."));
    } catch (error) {
        next(error);
    }
};

// --- Login ---
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password +status');

        if (!user || !(await compare(password, user.password))) {
            return next(AppError.unauthorized("Credenciales incorrectas"));
        }

        if (user.status !== "verified") {
            return next(AppError.forbidden("Verifica tu email primero"));
        }

        const token = generateAccessToken(user);
        const refreshTokenDoc = await RefreshToken.create({
            token: generateRefreshToken(),
            user: user._id,
            expiresAt: getRefreshTokenExpiry(),
            createdByIp: req.ip
        });

        res.json({ message: "Login exitoso", user, access_token: token, refresh_token: refreshTokenDoc.token });
    } catch (error) {
        next(error);
    }
};

// --- Registro de Compañía ---
export const registerCompany = async (req, res, next) => {
    try {
        const companyData = req.body;
        const userId = req.user._id;

        // Buscamos si la compañía ya existe por CIF
        let company = await Company.findOne({ cif: companyData.cif });

        if (company) {
            // Si existe, vinculamos al usuario como guest
            const user = await User.findByIdAndUpdate(userId, { company: company._id, role: "guest" }, { new: true });
            return res.json({ message: "Usuario añadido a la compañía existente", user, company });
        }

        // Si no existe, la creamos
        const userData = await User.findById(userId);
        companyData.owner = userId;

        if (companyData.isFreelance) {
            companyData.name = userData.name;
            companyData.cif = userData.nif;
            companyData.address = userData.address;
        }

        const newCompany = await Company.create(companyData);
        const updatedUser = await User.findByIdAndUpdate(userId, { company: newCompany._id, role: "admin" }, { new: true });

        res.status(201).json({
            message: "Compañía creada y vinculada",
            user: updatedUser,
            company: newCompany
        });
    } catch (error) {
        next(error);
    }
};

// --- Otros ---
export const registerDataUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
        res.json({ message: "Usuario actualizado", user });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('company');
        res.json(user);
    } catch (error) {
        next(error);
    }
};