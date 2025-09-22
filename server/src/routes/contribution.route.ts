import { Router } from "express";
import {
	createContribution,
	createMultipleContributions,
	getBuildingContributions,
	getFlatContributions,
	updateContribution,
	deleteContribution,
} from "../controllers/contribution.controller";

const router = Router();

router.post("/", createContribution);
router.post("/multiple", createMultipleContributions);
router.get("/building/:buildingId", getBuildingContributions);
router.get("/flat/:flatId", getFlatContributions);
router.put("/:id", updateContribution);
router.delete("/:id", deleteContribution);

export default router;
