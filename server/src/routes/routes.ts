import { Router } from "express";
import { adminAuthMiddleware, flatAuthMiddleware } from "../middlewares/auth.middleware";
import buildingRoutes from "./building.route";
import flatRoutes from "./flat.route";
import adminRoutes from "./admin.route";
import authRoutes from "./auth.route";
import billRoutes from "./bill.route";
import cylinderPLRoutes from "./cylinderPL.route";
import cylinderULRoutes from "./cylinderUL.router";
import contributionRoutes from "./contribution.route";
import gasUsageRoutes from "./gasUsage.route";
import serviceChargeRoutes from "./serviceCharge.route";
import dashRoutes from "./dash.routes";

const router = Router();

router.use("/buildings", buildingRoutes);
router.use("/flats", flatRoutes);
router.use("/admins", adminRoutes);
router.use("/auth", authRoutes);
router.use("/bills", billRoutes);
router.use("/cylinder-pls", cylinderPLRoutes);
router.use("/cylinder-uls", cylinderULRoutes);
router.use("/contributions", contributionRoutes);
router.use("/gas-usages", gasUsageRoutes);
router.use("/service-charges", serviceChargeRoutes);
router.use("/dash", dashRoutes);

export default router;
