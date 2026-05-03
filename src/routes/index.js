import { Router } from "express";
import userRouter from "./user.routes.js";
import clientRouter from "./client.routes.js";
import projectRouter from "./project.routes.js";
import deliveryNoteRouter from "./deliverynote.routes.js";

const router = Router();

router.use('/user',         userRouter);
router.use('/client',       clientRouter);
router.use('/project',      projectRouter);
router.use('/deliverynote', deliveryNoteRouter);

export default router;
