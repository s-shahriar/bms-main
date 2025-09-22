import { Router } from "express";
import {
	createCylinderPL,
	getBuildingCylinderPLs,
	updateCylinderPL,
	deleteCylinderPL,
} from "../controllers/cylinderPL.controller";

const router = Router();

router.post("/", createCylinderPL);
router.get("/building/:buildingId", getBuildingCylinderPLs);
router.put("/:id", updateCylinderPL);
router.delete("/:id", deleteCylinderPL);

export default router;
