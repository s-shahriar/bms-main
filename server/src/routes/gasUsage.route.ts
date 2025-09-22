import { Router } from "express";
import {
	createGasUsage,
	createMultipleGasUsages,
	getBuildingGasUsages,
	getFlatGasUsages,
	updateGasUsage,
	updateMultipleGasUsages,
	deleteGasUsage,
} from "../controllers/gasUsage.controller";

const router = Router();

router.post("/", createGasUsage);
router.post("/multiple", createMultipleGasUsages);
router.get("/building/:buildingId", getBuildingGasUsages);
router.get("/flat/:flatId", getFlatGasUsages);
router.put("/:id", updateGasUsage);
router.put("/multiple/:id", updateMultipleGasUsages);
router.delete("/:id", deleteGasUsage);

export default router;
