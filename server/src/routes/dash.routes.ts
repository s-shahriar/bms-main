import { Router } from "express";
import {
	getMonthlyBuildingSummary,
	getYearlyBuildingChartData,
	getMonthlyFlatSummary,
	getYearlyFlatChartData,
} from "../controllers/dash.controller";

const router = Router();

router.get("/monthly-building-summary/:buildingId", getMonthlyBuildingSummary);
router.get("/yearly-building-chart-data/:buildingId", getYearlyBuildingChartData);
router.get("/monthly-flat-summary/:flatId", getMonthlyFlatSummary);
router.get("/yearly-flat-chart-data/:flatId", getYearlyFlatChartData);

export default router;
