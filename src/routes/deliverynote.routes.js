import { Router } from "express";
import { validateUser } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/upload.js";
import * as deliveryNoteSchema from "../validators/deliverynote.validator.js";
import * as deliveryNoteController from "../controllers/deliverynote.controller.js";

const router = Router();

router.use(validateUser);

/**
 * @swagger
 * tags:
 *   name: Albaranes
 *   description: Gestión de albaranes
 */

/**
 * @swagger
 * /deliverynote:
 *   post:
 *     summary: Crear albarán
 *     tags: [Albaranes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project, format, workDate]
 *             properties:
 *               project:     { type: string, description: 'ObjectId del proyecto' }
 *               format:      { type: string, enum: [material, hours] }
 *               description: { type: string }
 *               workDate:    { type: string, format: date, example: '2025-06-01' }
 *               material:    { type: string }
 *               quantity:    { type: number }
 *               unit:        { type: string }
 *               hours:       { type: number }
 *               workers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:  { type: string }
 *                     hours: { type: number }
 *     responses:
 *       201:
 *         description: Albarán creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 */
router.post('/',           validate(deliveryNoteSchema.schemaCreateDeliveryNote), deliveryNoteController.createDeliveryNote);

/**
 * @swagger
 * /deliverynote:
 *   get:
 *     summary: Listar albaranes con paginación y filtros
 *     tags: [Albaranes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: project
 *         schema: { type: string }
 *       - in: query
 *         name: client
 *         schema: { type: string }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [material, hours] }
 *       - in: query
 *         name: signed
 *         schema: { type: boolean }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: '-workDate' }
 *     responses:
 *       200:
 *         description: Lista paginada de albaranes
 */
router.get('/',                                                                    deliveryNoteController.getDeliveryNotes);

/**
 * @swagger
 * /deliverynote/pdf/{id}:
 *   get:
 *     summary: Descargar albarán en PDF
 *     tags: [Albaranes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF del albarán
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       302:
 *         description: Redirect a URL del PDF en la nube (si está firmado)
 */
router.get('/pdf/:id',     validate(deliveryNoteSchema.schemaDeliveryNoteId),     deliveryNoteController.downloadPdf);

/**
 * @swagger
 * /deliverynote/{id}:
 *   get:
 *     summary: Obtener albarán con populate completo
 *     tags: [Albaranes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Datos del albarán con usuario, cliente y proyecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       404:
 *         description: Albarán no encontrado
 */
router.get('/:id',         validate(deliveryNoteSchema.schemaDeliveryNoteId),     deliveryNoteController.getDeliveryNote);

/**
 * @swagger
 * /deliverynote/{id}/sign:
 *   patch:
 *     summary: Firmar albarán con imagen de firma
 *     tags: [Albaranes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado, PDF generado y subido a la nube
 *       409:
 *         description: El albarán ya está firmado
 */
router.patch('/:id/sign',  validate(deliveryNoteSchema.schemaDeliveryNoteId),     upload.single("signature"), deliveryNoteController.signDeliveryNote);

/**
 * @swagger
 * /deliverynote/{id}:
 *   delete:
 *     summary: Eliminar albarán (solo si no está firmado)
 *     tags: [Albaranes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       403:
 *         description: No se puede eliminar un albarán firmado
 */
router.delete('/:id',      validate(deliveryNoteSchema.schemaDeliveryNoteId),     deliveryNoteController.deleteDeliveryNote);

export default router;
