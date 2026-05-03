import { Router } from "express";
import { validateUser } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/upload.js";
import * as deliveryNoteSchema from "../validators/deliverynote.validator.js";
import * as deliveryNoteController from "../controllers/deliverynote.controller.js";

const router = Router();

router.use(validateUser);

router.post('/',           validate(deliveryNoteSchema.schemaCreateDeliveryNote), deliveryNoteController.createDeliveryNote);
router.get('/',                                                                    deliveryNoteController.getDeliveryNotes);
router.get('/pdf/:id',     validate(deliveryNoteSchema.schemaDeliveryNoteId),     deliveryNoteController.downloadPdf);
router.get('/:id',         validate(deliveryNoteSchema.schemaDeliveryNoteId),     deliveryNoteController.getDeliveryNote);
router.patch('/:id/sign',  validate(deliveryNoteSchema.schemaDeliveryNoteId),     upload.single("signature"), deliveryNoteController.signDeliveryNote);
router.delete('/:id',      validate(deliveryNoteSchema.schemaDeliveryNoteId),     deliveryNoteController.deleteDeliveryNote);

export default router;
