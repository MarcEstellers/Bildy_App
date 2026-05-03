import { Router } from "express";
import { validateUser } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import * as clientSchema from "../validators/client.validator.js";
import * as clientController from "../controllers/client.controller.js";

const router = Router();

router.use(validateUser);

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestión de clientes
 */

/**
 * @swagger
 * /client:
 *   post:
 *     summary: Crear cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cif]
 *             properties:
 *               name:  { type: string, example: 'Empresa ABC' }
 *               cif:   { type: string, example: 'B12345678' }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Cliente creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       409:
 *         description: CIF duplicado en la compañía
 */
router.post('/',              validate(clientSchema.schemaCreateClient), clientController.createClient);

/**
 * @swagger
 * /client/archived:
 *   get:
 *     summary: Listar clientes archivados
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 */
router.get('/archived',                                                  clientController.getArchivedClients);

/**
 * @swagger
 * /client:
 *   get:
 *     summary: Listar clientes con paginación y filtros
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Búsqueda parcial por nombre
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: '-createdAt' }
 *     responses:
 *       200:
 *         description: Lista paginada de clientes
 */
router.get('/',                                                          clientController.getClients);

/**
 * @swagger
 * /client/{id}:
 *   get:
 *     summary: Obtener un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Datos del cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id',            validate(clientSchema.schemaClientId),    clientController.getClient);

/**
 * @swagger
 * /client/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id',            validate(clientSchema.schemaUpdateClient), clientController.updateClient);

/**
 * @swagger
 * /client/{id}:
 *   delete:
 *     summary: Eliminar cliente (lógico o físico)
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: soft
 *         schema: { type: string, enum: [true, false] }
 *     responses:
 *       200:
 *         description: Cliente eliminado
 */
router.delete('/:id',         validate(clientSchema.schemaClientId),    clientController.deleteClient);

/**
 * @swagger
 * /client/{id}/restore:
 *   patch:
 *     summary: Restaurar cliente archivado
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cliente restaurado
 *       404:
 *         description: Cliente archivado no encontrado
 */
router.patch('/:id/restore',  validate(clientSchema.schemaClientId),    clientController.restoreClient);

export default router;
