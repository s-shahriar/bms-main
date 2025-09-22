import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { JWT_KEY } from "../config/env";
import Admin from "../models/admin.model";
import Flat from "../models/flat.model";

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
		if (!token) {
			res.status(401).json({ message: "Unauthorized - Token wasn't provided" });
			return;
		}

		const decoded = verify(token, JWT_KEY!) as { id: string };
		const admin = await Admin.findById(decoded.id).select("-password");
		if (!admin) {
			res.status(404).json({ message: "Couldn't find admin" });
			return;
		}

		(req as any).admin = admin;
		next();
	} catch (error: any) {
		// console.error("Authentication error:", error.message);
		res.status(401).json({ message: "Unauthorized - Token is expired or invalid" });
	}
};

export const flatAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
		if (!token) {
			res.status(401).json({ message: "Unauthorized - Token wasn't provided" });
			return;
		}

		const decoded = verify(token, JWT_KEY!) as { id: string };
		const flat = await Flat.findById(decoded.id).populate("building");
		if (!flat) {
			res.status(404).json({ message: "Couldn't find flat" });
			return;
		}

		(req as any).flat = flat;
		next();
	} catch (error: any) {
		// console.error("Authentication error:", error.message);
		res.status(401).json({ message: "Unauthorized - Token is expired or invalid" });
	}
};
