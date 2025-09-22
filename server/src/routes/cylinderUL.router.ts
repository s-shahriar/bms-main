import { Router } from "express";
import {
	createCylinderUL,
	getBuildingCylinderULs,
	updateCylinderUL,
	deleteCylinderUL,
} from "../controllers/cylinderUL.controller";

const router = Router();

router.post("/", createCylinderUL);
router.get("/building/:buildingId", getBuildingCylinderULs);
router.put("/:id", updateCylinderUL);
router.delete("/:id", deleteCylinderUL);

export default router;
