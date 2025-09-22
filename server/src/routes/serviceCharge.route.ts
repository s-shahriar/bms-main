import { Router } from "express";
import {
	createServiceCharge,
	createMultipleServiceCharges,
	getBuildingServiceCharges,
	getFlatServiceCharges,
	updateServiceCharge,
	deleteServiceCharge,
} from "../controllers/serviceCharge.controller";

const router = Router();

router.post("/", createServiceCharge);
router.post("/multiple", createMultipleServiceCharges);
router.get("/building/:buildingId", getBuildingServiceCharges);
router.get("/flat/:flatId", getFlatServiceCharges);
router.put("/:id", updateServiceCharge);
router.delete("/:id", deleteServiceCharge);

export default router;
