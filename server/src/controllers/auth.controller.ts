import { Request, Response } from "express";
import Admin from "../models/admin.model";
import Flat from "../models/flat.model";
import { genSalt, hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { JWT_KEY } from "../config/env";
import { NODE_ENV } from "../config/env";

export const adminSignUp = async (req: Request, res: Response) => {
	try {
		const { username, email, password } = req.body;
		if (!username || !email || !password) {
			res.status(400).json({ message: "Parameters are missing" });
			return;
		}

		if (!JWT_KEY) {
			console.error("JWT_KEY is not defined in the environment variables");
			res.status(500).json({ message: "Internal server error" });
			return;
		}

		const existingAdmin = await Admin.findOne({ email });
		if (existingAdmin) {
			res.status(409).json({ message: "An admin with this email already exists" });
			return;
		}

		const salt = await genSalt(8);
		const hashedPassword = await hash(password, salt);
		const admin = await Admin.create({
			username,
			email: email.toLowerCase().trim(),
			password: hashedPassword,
		});
		if (!admin) {
			res.status(500).json({ message: "Failed to create admin" });
		} else {
			const token = sign({ id: admin._id }, JWT_KEY, { expiresIn: "1h" });
			res.cookie("token", token, {
				httpOnly: true,
				secure: NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 60 * 60 * 1000,
			})
				.status(201)
				.json({ message: "Admin has signed up" });
		}
	} catch (error: any) {
		console.error("Error signing admin up:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const adminSignIn = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			res.status(400).json({ message: "Parameters are missing" });
			return;
		}

		if (!JWT_KEY) {
			console.error("JWT_KEY is not defined in the environment variables");
			res.status(500).json({ message: "Internal server error" });
			return;
		}

		const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
		if (!admin) {
			res.status(404).json({ message: "Couldn't find any admin with this email" });
			return;
		}

		const isPasswordValid = await compare(password, admin.password);
		if (!isPasswordValid) {
			res.status(401).json({ message: "The password is invalid" });
			return;
		}

		const token = sign({ id: admin._id }, JWT_KEY, { expiresIn: "1h" });
		res.cookie("token", token, {
			httpOnly: true,
			secure: NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 1000,
		})
			.status(200)
			.json({ message: "Admin has signed in" });
	} catch (error: any) {
		console.error("Error signing admin in:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const adminSignOut = (req: Request, res: Response) => {
	try {
		res.clearCookie("token", {
			httpOnly: true,
			secure: NODE_ENV === "production",
			sameSite: "strict",
		})
			.status(200)
			.json({ message: "Admin has signed out" });
	} catch (error: any) {
		console.error("Error signing admin out:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const flatSignIn = async (req: Request, res: Response) => {
	try {
		const { flatNumber, phone } = req.body;
		if (!flatNumber || !phone) {
			res.status(400).json({ message: "Parameters are missing" });
			return;
		}

		if (!JWT_KEY) {
			console.error("JWT_KEY is not defined in the environment variables");
			res.status(500).json({ message: "Internal server error" });
			return;
		}

		const flat = await Flat.findOne({
			flatNumber: flatNumber.toUpperCase().trim(),
			$or: [{ ownerPhone: phone }, { renterPhone: phone }],
		});
		if (!flat) {
			res.status(404).json({
				message: "Couldn't find any flat resident with these credentials",
			});
			return;
		}

		const token = sign({ id: flat._id }, JWT_KEY, { expiresIn: "1h" });
		res.cookie("token", token, {
			httpOnly: true,
			secure: NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 1000,
		})
			.status(200)
			.json({ message: "Flat resident has signed in" });
	} catch (error: any) {
		console.error("Error signing flat resident in:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const flatSignOut = (req: Request, res: Response) => {
	try {
		res.clearCookie("token", {
			httpOnly: true,
			secure: NODE_ENV === "production",
			sameSite: "strict",
		})
			.status(200)
			.json({ message: "Flat resident has signed out" });
	} catch (error: any) {
		console.error("Error signing flat resident out:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
