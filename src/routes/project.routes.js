import { Router } from "express";
import { validateUser } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import * as projectSchema from "../validators/project.validator.js";
import * as projectController from "../controllers/project.controller.js";

const router = Router();

router.use(validateUser);

router.post('/',             validate(projectSchema.schemaCreateProject),  projectController.createProject);
router.get('/archived',                                                     projectController.getArchivedProjects);
router.get('/',                                                             projectController.getProjects);
router.get('/:id',           validate(projectSchema.schemaProjectId),      projectController.getProject);
router.put('/:id',           validate(projectSchema.schemaUpdateProject),  projectController.updateProject);
router.delete('/:id',        validate(projectSchema.schemaProjectId),      projectController.deleteProject);
router.patch('/:id/restore', validate(projectSchema.schemaProjectId),      projectController.restoreProject);

export default router;
