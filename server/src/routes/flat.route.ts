import { Router } from "express";
import {
	createFlat,
	getFlats,
	getBuildingFlats,
	getFlat,
	updateFlat,
	deleteFlat,
} from "../controllers/flat.controller";

const router = Router();

router.post("/", createFlat);
router.get("/", getFlats);
router.get("/building/:buildingId", getBuildingFlats);
router.get("/:id", getFlat);
router.put("/:id", updateFlat);
router.delete("/:id", deleteFlat);

export default router;
