import { Router } from "express";
import {
	createBill,
	createBills,
	getBills,
	getFlatBills,
	deleteBill,
	updateBill,
	getFlatBillRemaining,
} from "../controllers/bill.controller";

const router = Router();

router.post("/create", createBill);
router.post("/upload", createBills);
router.get("/", getBills);
router.get("/flat/:flatId", getFlatBills);
router.get("/flat/remaining/:flatId", getFlatBillRemaining);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

export default router;
