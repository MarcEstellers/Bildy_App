import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import { AppError } from "../utils/AppError.js";
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from "../utils/handleJWT.js";
import { compare, encrypt } from "../utils/handlePassword.js";
import notificationService from "../services/notification.service.js";

const generateRandomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const createSession = async (user) => {
    const accessToken = generateAccessToken(user);
    const refreshTokenDoc = await RefreshToken.create({
        token: generateRefreshToken(),
        user: user._id,
        expiresAt: getRefreshTokenExpiry()
    });

    return {
        access_token: accessToken,
        refresh_token: refreshTokenDoc.token
    };
};

export const registerUser = async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email }).select('+status');

    if (existingUser?.status === "verified") {
        throw AppError.conflict("Ya existe un usuario verificado con ese email");
    }

    const encryptedPassword = await encrypt(password);
    const verificationCode = generateRandomCode();
    let user;

    if (existingUser?.status === "pending") {
        existingUser.password = encryptedPassword;
        existingUser.verificationCode = verificationCode;
        existingUser.verificationAttempts = 3;
        user = await existingUser.save();
    } else {
        user = await User.create({
            email,
            password: encryptedPassword,
            verificationCode
        });
    }

    const session = await createSession(user);
    
    notificationService.registerUser({ userId: user._id, email: user.email });

    res.status(201).json({
        message: "Usuario registrado. Por favor, verifica tu email.",
        user,
        code_debug: verificationCode,
        ...session
    });
};

export const validateEmail = async (req, res) => {
    const { code } = req.body;
    
    const user = await User.findById(req.user._id).select('+verificationCode +verificationAttempts');

    if (!user) throw AppError.notFound("Usuario no encontrado");
    if (user.status === "verified") throw AppError.badRequest("Email ya verificado");

    if (user.verificationCode === code) {
        user.status = "verified";
        user.verificationAttempts = 3;
        await user.save();
        
        notificationService.verifyUser({ userId: user._id, email: user.email });

        return res.json({ message: "Usuario verificado con éxito", user });
    } 
    
    const currentAttempts = typeof user.verificationAttempts === 'number' ? user.verificationAttempts : 3;
    user.verificationAttempts = currentAttempts - 1;

    if (user.verificationAttempts <= 0) {
        await User.findByIdAndDelete(user._id);
        throw AppError.tooManyRequests("Intentos agotados. Registro eliminado.");
    }
    
    await user.save();
    throw AppError.badRequest("Código incorrecto", `Quedan ${user.verificationAttempts} intentos`);
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +status');

    if (!user || !(await compare(password, user.password))) {
        throw AppError.unauthorized("Credenciales incorrectas");
    }

    if (user.status !== "verified") {
        throw AppError.forbidden("Debes verificar tu cuenta primero");
    }

    const session = await createSession(user);
    res.json({ message: "Bienvenido", user, ...session });
};

export const registerDataUser = async (req, res) => {
    const user = req.user;
    user.set(req.body);
    await user.save();
    res.json({ message: "Perfil actualizado", user });
};

export const registerCompany = async (req, res) => {
    const companyData = req.body;
    const user = req.user;

    if (user.company) throw AppError.conflict("Ya perteneces a una compañía");

    let company = await Company.findOne({ cif: companyData.cif });

    if (company) {
        user.company = company._id;
        user.role = "guest";
        await user.save();
        return res.json({ message: "Vinculado a compañía existente", user, company });
    }

    companyData.owner = user._id;
    if (companyData.isFreelance) {
        companyData.name = `${user.name} ${user.lastName}`;
        companyData.cif = user.nif;
        companyData.address = user.address;
    }

    company = await Company.create(companyData);
    user.company = company._id;
    user.role = "admin";
    await user.save();

    res.status(201).json({ message: "Compañía creada", user, company });
};

export const uploadLogo = async (req, res) => {
    if (!req.file) throw AppError.badRequest("No se ha subido ningún archivo");
    if (!req.user.company) throw AppError.forbidden("No tienes una compañía asociada");

    const logoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const company = await Company.findByIdAndUpdate(
        req.user.company, 
        { logo: logoUrl }, 
        { new: true }
    );

    res.json({ message: "Logo actualizado", company });
};

export const refreshSession = async (req, res) => {
    const { refreshToken } = req.body;
    const storedToken = await RefreshToken.findOne({ token: refreshToken }).populate("user");

    if (!storedToken || !storedToken.isActive() || !storedToken.user) {
        throw AppError.unauthorized("Token de refresco inválido o expirado");
    }

    storedToken.revokedAt = new Date();
    await storedToken.save();

    const session = await createSession(storedToken.user);
    res.json({ message: "Sesión renovada", ...session });
};

export const logoutUser = async (req, res) => {
    await RefreshToken.updateMany(
        { user: req.user._id, revokedAt: null }, 
        { revokedAt: new Date() }
    );
    res.json({ message: "Sesión cerrada en todos los dispositivos" });
};

export const deleteUser = async (req, res) => {
    const isSoft = req.query.soft === "true";
    const id = req.user._id;

    let user;
    if (isSoft) {
        user = await User.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() }, { new: true });
    } else {
        user = await User.findByIdAndDelete(id);
        await RefreshToken.deleteMany({ user: id });
    }

    if (!user) throw AppError.notFound("Usuario");

    notificationService.deleteUser({ userId: id, soft: isSoft });

    res.json({ message: `Usuario eliminado (${isSoft ? 'Lógico' : 'Físico'})`, user });
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await compare(currentPassword, user.password))) {
        throw AppError.unauthorized("La contraseña actual es incorrecta");
    }

    user.password = await encrypt(newPassword);
    await user.save();
    
    res.json({ message: "Contraseña actualizada correctamente" });
};

export const inviteUser = async (req, res) => {
    const { email, password } = req.body;
    const admin = req.user;

    if (!admin.company) throw AppError.forbidden("Solo administradores con empresa pueden invitar");

    const existing = await User.findOne({ email });
    if (existing) throw AppError.conflict("El usuario ya está registrado");

    const invitedUser = await User.create({
        email,
        password: await encrypt(password),
        verificationCode: generateRandomCode(),
        role: "guest",
        company: admin.company,
        status: "pending"
    });

    notificationService.inviteUser({
        invitedEmail: email,
        companyId: admin.company,
        invitedBy: admin._id
    });

    res.status(201).json({ message: "Invitación enviada", user: invitedUser });
};

export const getUser = async (req, res) => {
    const user = await User.findById(req.user._id).populate('company');
    res.json({ user });
};