import { Router, Request, Response } from "express";
import { adminAuthMiddleware, flatAuthMiddleware } from "../middlewares/auth.middleware";
import {
	adminSignUp,
	adminSignIn,
	adminSignOut,
	flatSignIn,
	flatSignOut,
} from "../controllers/auth.controller";

const router = Router();

router.post("/admin-sign-up", adminSignUp);
router.post("/admin-sign-in", adminSignIn);
router.post("/flat-sign-in", flatSignIn);
router.post("/admin-sign-out", adminSignOut);
router.post("/flat-sign-out", flatSignOut);
router.get("/admin-auth-check", adminAuthMiddleware, (req: Request, res: Response) => {
	res.status(200).json({ message: "Admin is authneticated", admin: (req as any).admin });
});
router.get("/flat-auth-check", flatAuthMiddleware, (req: Request, res: Response) => {
	res.status(200).json({ message: "Flat resident is authneticated", flat: (req as any).flat });
});

export default router;
