import { Router } from "express";
import userRouter from "./user.routes.js";
import clientRouter from "./client.routes.js";

const router = Router();

router.use('/user',   userRouter);
router.use('/client', clientRouter);

export default router;
