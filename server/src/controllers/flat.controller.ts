import { Request, Response } from "express";
import Flat from "../models/flat.model";

export const createFlat = async (req: Request, res: Response) => {
	try {
		const {
			buildingId,
			flatNumber,
			ownerName,
			ownerPhone,
			ownerEmail,
			renterName,
			renterPhone,
			renterEmail,
			status = false,
		} = req.body;
		if (!buildingId || !flatNumber) {
			res.status(400).json({ message: "Building ID and flat number are required" });
			return;
		}

		const existingFlat = await Flat.findOne({ building: buildingId, flatNumber });
		if (existingFlat) {
			res.status(400).json({
				message: "A flat with this number already exists in the building",
			});
			return;
		}

		const flat = await Flat.create({
			building: buildingId,
			flatNumber,
			ownerName,
			ownerPhone,
			ownerEmail,
			renterName,
			renterPhone,
			renterEmail,
			status,
		});
		res.status(201).json(flat);
	} catch (error: any) {
		console.error("Error creating flat:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getFlats = async (req: Request, res: Response) => {
	try {
		const flats = await Flat.find().populate("building").sort({ flatNumber: 1 });
		res.status(200).json(flats);
	} catch (error: any) {
		console.error("Error fetching flats:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getBuildingFlats = async (req: Request, res: Response) => {
	try {
		const { buildingId } = req.params;
		if (!buildingId) {
			res.status(400).json({ message: "Building ID is required" });
			return;
		}

		const flats = await Flat.find({ building: buildingId })
			.populate("building")
			.sort({ flatNumber: 1 });
		res.status(200).json(flats);
	} catch (error: any) {
		console.error("Error fetching flats for this building:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getFlatByNumber = async (req: Request, res: Response) => {
	try {
		const { flatNumber } = req.params;
		if (!flatNumber) {
			res.status(400).json({ message: "Flat Number is required" });
			return;
		}

		const flat = await Flat.findOne({ flatNumber }).populate("building");
		if (!flat) {
			res.status(404).json({ message: "Couldn't find any flat with this number" });
			return;
		}

		res.status(200).json(flat);
	} catch (error: any) {
		console.error("Error fetching flat:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getFlat = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Flat ID is required" });
			return;
		}

		const flat = await Flat.findById(id).populate("building");
		if (!flat) {
			res.status(404).json({ message: "Couldn't find any flat with this ID" });
			return;
		}

		res.status(200).json(flat);
	} catch (error: any) {
		console.error("Error fetching flat:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const updateFlat = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const {
			ownerName,
			ownerPhone,
			ownerEmail,
			renterName,
			renterPhone,
			renterEmail,
			status = false,
		} = req.body;
		if (!id) {
			res.status(400).json({ message: "Flat ID is required" });
			return;
		}

		const flat = await Flat.findByIdAndUpdate(
			id,
			{ ownerName, ownerPhone, ownerEmail, renterName, renterPhone, renterEmail, status },
			{ new: true }
		).populate("building");
		if (!flat) {
			res.status(404).json({ message: "Couldn't find any flat with this ID" });
			return;
		}

		res.status(200).json(flat);
	} catch (error: any) {
		console.error("Error updating flat:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteFlat = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Flat ID is required" });
			return;
		}

		const flat = await Flat.findByIdAndDelete(id);
		if (!flat) {
			res.status(404).json({ message: "Couldn't find any flat with this ID" });
			return;
		}

		res.status(200).json({ message: "Flat has been deleted" });
	} catch (error: any) {
		console.error("Error deleting flat:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
