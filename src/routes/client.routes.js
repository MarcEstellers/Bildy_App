import { Router } from "express";
import { validateUser } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import * as clientSchema from "../validators/client.validator.js";
import * as clientController from "../controllers/client.controller.js";

const router = Router();

router.use(validateUser);

router.post('/',              validate(clientSchema.schemaCreateClient), clientController.createClient);
router.get('/archived',                                                  clientController.getArchivedClients);
router.get('/',                                                          clientController.getClients);
router.get('/:id',            validate(clientSchema.schemaClientId),    clientController.getClient);
router.put('/:id',            validate(clientSchema.schemaUpdateClient), clientController.updateClient);
router.delete('/:id',         validate(clientSchema.schemaClientId),    clientController.deleteClient);
router.patch('/:id/restore',  validate(clientSchema.schemaClientId),    clientController.restoreClient);

export default router;
