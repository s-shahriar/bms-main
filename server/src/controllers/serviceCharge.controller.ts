import { Request, Response } from "express";
import ServiceCharge from "../models/serviceCharge.model";
import Flat from "../models/flat.model";

export const createServiceCharge = async (req: Request, res: Response) => {
	try {
		const { flatId, month, year, amount = 0 } = req.body;
		if (!flatId || !month || !year) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingServiceCharge = await ServiceCharge.findOne({
			flat: flatId,
			month,
			year,
		});
		if (existingServiceCharge) {
			res.status(409).json({ message: "A service charge already exists" });
			return;
		}

		const serviceCharge = await ServiceCharge.create({
			flat: flatId,
			month,
			year,
			amount,
		});
		res.status(201).json({ message: "Service Charge has been created", data: serviceCharge });
	} catch (error: any) {
		console.error("Error creating service charge:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const createMultipleServiceCharges = async (req: Request, res: Response) => {
	try {
		const { data } = req.body;
		if (!Array.isArray(data) || data.length === 0) {
			res.status(400).json({ message: "Data is invalid or missing" });
			return;
		}

		let count = 0;
		const errors: string[] = [];

		for (const [index, item] of data.entries()) {
			const { flatId, month, year, amount = 0 } = item;
			if (!flatId || !month || !year) {
				errors.push(`Entry ${index + 1}: Data is missing`);
				continue;
			}

			const existingServiceCharge = await ServiceCharge.findOne({
				flat: flatId,
				month,
				year,
			}).populate("flat");
			if (existingServiceCharge) {
				errors.push(
					`Entry ${index + 1}: A service charge already exists for ${
						existingServiceCharge.flat.flatName
					} flat`
				);
				continue;
			}

			await ServiceCharge.create({
				flat: flatId,
				month,
				year,
				amount: amount || 0,
			});
			count++;
		}

		res.status(201).json({
			message: `${count} service charges have been created`,
			errors,
		});
	} catch (error: any) {
		console.error("Error creating multiple service charges:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getBuildingServiceCharges = async (req: Request, res: Response) => {
	try {
		const { buildingId } = req.params;
		const { starting, ending } = req.query;
		if (!buildingId || !starting || !ending) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const [startingYear, startingMonth] = (starting as string).split("-").map(Number);
		const [endingYear, endingMonth] = (ending as string).split("-").map(Number);

		const startValue = startingYear * 100 + startingMonth;
		const endValue = endingYear * 100 + endingMonth;

		const rangeQuery = {
			$expr: {
				$and: [
					{
						$gte: [{ $add: [{ $multiply: ["$year", 100] }, "$month"] }, startValue],
					},
					{
						$lte: [{ $add: [{ $multiply: ["$year", 100] }, "$month"] }, endValue],
					},
				],
			},
		};

		const flatIds = await Flat.find({ building: buildingId }).select("_id");
		const serviceCharges = await ServiceCharge.find({ flat: { $in: flatIds }, ...rangeQuery })
			.populate("flat")
			.sort({ year: -1, month: -1 });

		res.status(200).json(serviceCharges);
	} catch (error: any) {
		console.error("Error fetching building service charges:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getFlatServiceCharges = async (req: Request, res: Response) => {
	try {
		const { flatId } = req.params;
		const { starting, ending, page = 1 } = req.query;
		if (!flatId || !starting || !ending) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const [startingYear, startingMonth] = (starting as string).split("-").map(Number);
		const [endingYear, endingMonth] = (ending as string).split("-").map(Number);

		const startValue = startingYear * 100 + startingMonth;
		const endValue = endingYear * 100 + endingMonth;

		const rangeQuery = {
			$expr: {
				$and: [
					{
						$gte: [{ $add: [{ $multiply: ["$year", 100] }, "$month"] }, startValue],
					},
					{
						$lte: [{ $add: [{ $multiply: ["$year", 100] }, "$month"] }, endValue],
					},
				],
			},
		};

		const serviceCharges = await ServiceCharge.find({ flat: flatId, ...rangeQuery })
			.populate("flat")
			.sort({ year: -1, month: -1 });

		res.status(200).json(serviceCharges);
	} catch (error: any) {
		console.error("Error fetching flat service charges:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const updateServiceCharge = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Service charge ID is required" });
			return;
		}

		const { flatId, month, year, amount } = req.body;
		if (!flatId || !month || !year || amount === undefined) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingServiceCharge = await ServiceCharge.findOne({
			_id: { $ne: id },
			flat: flatId,
			month,
			year,
		});

		if (existingServiceCharge) {
			res.status(409).json({
				message: "A service charge already exists",
			});
			return;
		}

		const serviceCharge = await ServiceCharge.findByIdAndUpdate(
			id,
			{ flat: flatId, month, year, amount },
			{ new: true }
		).populate("flat");
		if (!serviceCharge) {
			res.status(404).json({ message: "Couldn't find any service charge with this ID" });
			return;
		}
		res.status(200).json({ message: "Service charge has been updated", data: serviceCharge });
	} catch (error: any) {
		console.error("Error updating service charge:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteServiceCharge = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Service charge ID is required" });
			return;
		}

		const serviceCharge = await ServiceCharge.findByIdAndDelete(id);
		if (!serviceCharge) {
			res.status(404).json({ message: "Couldn't find any service charge with this ID" });
			return;
		}

		res.status(200).json({ message: "Service charge has been deleted" });
	} catch (error: any) {
		console.error("Error deleting service charge:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
