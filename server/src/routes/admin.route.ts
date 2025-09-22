import { Router } from "express";
import { createAdmin, getAdmin, deleteAdmin } from "../controllers/admin.controller";

const router = Router();

router.post("/", createAdmin);
router.get("/:id", getAdmin);
router.delete("/:id", deleteAdmin);

export default router;
