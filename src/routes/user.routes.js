import { Router } from "express";
import { validateUser} from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import * as userSchema from "../validators/user.validator.js";
import * as userController from "../controllers/user.controller.js";
import upload from "../middleware/upload.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y autenticación
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Usuarios]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validate(userSchema.schemaMailBody), userController.registerUser);

/**
 * @swagger
 * /user/validation:
 *   put:
 *     summary: Validar email con código de verificación
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, example: '123456' }
 *     responses:
 *       200:
 *         description: Email verificado
 *       400:
 *         description: Código incorrecto
 */
router.put('/validation', validate(userSchema.schemaCodeBody), validateUser, userController.validateEmail);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Usuarios]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login correcto, devuelve tokens
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', validate(userSchema.schemaMailBody), userController.loginUser);

/**
 * @swagger
 * /user/register:
 *   put:
 *     summary: Completar perfil del usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, lastName, nif]
 *             properties:
 *               name:     { type: string }
 *               lastName: { type: string }
 *               nif:      { type: string, example: '12345678A' }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.put('/register', validate(userSchema.schemaUserBody), validateUser, userController.registerDataUser);

/**
 * @swagger
 * /user/company:
 *   patch:
 *     summary: Crear o vincularse a una compañía
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   isFreelance: { type: boolean, example: true }
 *               - type: object
 *                 properties:
 *                   isFreelance: { type: boolean, example: false }
 *                   name: { type: string }
 *                   cif:  { type: string }
 *     responses:
 *       200:
 *         description: Compañía creada o vinculada
 */
router.patch('/company', validate(userSchema.schemaCompanyBody), validateUser, userController.registerCompany);

/**
 * @swagger
 * /user/logo:
 *   patch:
 *     summary: Subir logo de la compañía
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo actualizado
 */
router.patch('/logo', validateUser, authorizeRoles("admin"), upload.single("logo"), userController.uploadLogoController);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/', validateUser, userController.getUser);

/**
 * @swagger
 * /user/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Usuarios]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Nuevos tokens
 */
router.post('/refresh', validate(userSchema.schemaRefreshTokenBody), userController.refreshSession);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Cerrar sesión en todos los dispositivos
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post('/logout', validateUser, userController.logoutUser);

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Eliminar cuenta
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: true para borrado lógico, false para físico
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.delete('/', validate(userSchema.schemaSoftDelete), validateUser, userController.deleteUser);

/**
 * @swagger
 * /user/password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword:     { type: string }
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 */
router.put('/password', validate(userSchema.schemaPasswordBody), validateUser, userController.changePassword);

/**
 * @swagger
 * /user/invite:
 *   post:
 *     summary: Invitar usuario a la compañía
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Invitación enviada
 */
router.post('/invite', validate(userSchema.schemaMailBody), validateUser, authorizeRoles("admin"), userController.inviteUser);

export default router;
