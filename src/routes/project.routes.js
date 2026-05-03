import { Router } from "express";
import { validateUser } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import * as projectSchema from "../validators/project.validator.js";
import * as projectController from "../controllers/project.controller.js";

const router = Router();

router.use(validateUser);

/**
 * @swagger
 * tags:
 *   name: Proyectos
 *   description: Gestión de proyectos
 */

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Crear proyecto
 *     tags: [Proyectos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, projectCode, client]
 *             properties:
 *               name:        { type: string, example: 'Reforma oficina' }
 *               projectCode: { type: string, example: 'PRJ-001' }
 *               client:      { type: string, description: 'ObjectId del cliente' }
 *               email:       { type: string, format: email }
 *               notes:       { type: string }
 *               active:      { type: boolean }
 *     responses:
 *       201:
 *         description: Proyecto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       409:
 *         description: Código de proyecto duplicado
 */
router.post('/',             validate(projectSchema.schemaCreateProject),  projectController.createProject);

/**
 * @swagger
 * /project/archived:
 *   get:
 *     summary: Listar proyectos archivados
 *     tags: [Proyectos]
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get('/archived',                                                     projectController.getArchivedProjects);

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Listar proyectos con paginación y filtros
 *     tags: [Proyectos]
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
 *       - in: query
 *         name: client
 *         schema: { type: string }
 *         description: Filtrar por ObjectId de cliente
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: '-createdAt' }
 *     responses:
 *       200:
 *         description: Lista paginada de proyectos
 */
router.get('/',                                                             projectController.getProjects);

/**
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Obtener un proyecto
 *     tags: [Proyectos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Datos del proyecto con cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/:id',           validate(projectSchema.schemaProjectId),      projectController.getProject);

/**
 * @swagger
 * /project/{id}:
 *   put:
 *     summary: Actualizar proyecto
 *     tags: [Proyectos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 */
router.put('/:id',           validate(projectSchema.schemaUpdateProject),  projectController.updateProject);

/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: Eliminar proyecto (lógico o físico)
 *     tags: [Proyectos]
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
 *         description: Proyecto eliminado
 */
router.delete('/:id',        validate(projectSchema.schemaProjectId),      projectController.deleteProject);

/**
 * @swagger
 * /project/{id}/restore:
 *   patch:
 *     summary: Restaurar proyecto archivado
 *     tags: [Proyectos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proyecto restaurado
 */
router.patch('/:id/restore', validate(projectSchema.schemaProjectId),      projectController.restoreProject);

export default router;
