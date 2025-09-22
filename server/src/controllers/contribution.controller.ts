import { Request, Response } from "express";
import Contribution from "../models/contribution.model";
import Flat from "../models/flat.model";

export const createContribution = async (req: Request, res: Response) => {
	try {
		const { flatId, month, year, amount = 0 } = req.body;
		if (!flatId || !month || !year) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingContribution = await Contribution.findOne({
			flat: flatId,
			month,
			year,
		});
		if (existingContribution) {
			res.status(409).json({ message: "A contribution already exists" });
			return;
		}

		const contribution = await Contribution.create({
			flat: flatId,
			month,
			year,
			amount,
		});
		res.status(201).json({ message: "Contribution has been created", data: contribution });
	} catch (error: any) {
		console.error("Error creating contribution:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const createMultipleContributions = async (req: Request, res: Response) => {
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

			const existingContribution = await Contribution.findOne({
				flat: flatId,
				month,
				year,
			}).populate("flat");
			if (existingContribution) {
				errors.push(
					`Entry ${index + 1}: A contribution already exists for ${
						existingContribution.flat.flatName
					} flat`
				);
				continue;
			}

			await Contribution.create({
				flat: flatId,
				month,
				year,
				amount: amount || 0,
			});
			count++;
		}

		res.status(201).json({
			message: `${count} contributions have been created`,
			errors,
		});
	} catch (error: any) {
		console.error("Error creating multiple contributions:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getBuildingContributions = async (req: Request, res: Response) => {
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
		const contributions = await Contribution.find({ flat: { $in: flatIds }, ...rangeQuery })
			.populate("flat")
			.sort({ year: -1, month: -1 });

		res.status(200).json(contributions);
	} catch (error: any) {
		console.error("Error fetching building contributions:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getFlatContributions = async (req: Request, res: Response) => {
	try {
		const { flatId } = req.params;
		const { starting, ending } = req.query;
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

		const contributions = await Contribution.find({ flat: flatId, ...rangeQuery })
			.populate("flat")
			.sort({ year: -1, month: -1 });

		res.status(200).json(contributions);
	} catch (error: any) {
		console.error("Error fetching flat contributions:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const updateContribution = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Contribution ID is required" });
			return;
		}

		const { flatId, month, year, amount } = req.body;
		if (!flatId || !month || !year || amount === undefined) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingContribution = await Contribution.findOne({
			_id: { $ne: id },
			flat: flatId,
			month,
			year,
		});

		if (existingContribution) {
			res.status(409).json({
				message: "A contribution already exists",
			});
			return;
		}

		const contribution = await Contribution.findByIdAndUpdate(
			id,
			{ flat: flatId, month, year, amount },
			{ new: true }
		).populate("flat");
		if (!contribution) {
			res.status(404).json({ message: "Couldn't find any contribution with this ID" });
			return;
		}
		res.status(200).json({ message: "Contribution has been updated", data: contribution });
	} catch (error: any) {
		console.error("Error updating contribution:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteContribution = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Contribution ID is required" });
			return;
		}

		const contribution = await Contribution.findByIdAndDelete(id);
		if (!contribution) {
			res.status(404).json({ message: "Couldn't find any contribution with this ID" });
			return;
		}

		res.status(200).json({ message: "Contribution has been deleted" });
	} catch (error: any) {
		console.error("Error deleting contribution:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getCurrentFlatContribution = async (req: Request, res: Response) => {
	try {
		const { flatId } = req.params;

		const currentDate = new Date();
		const currentMonth = currentDate.getMonth() + 1;
		const currentYear = currentDate.getFullYear();

		const contribution = await Contribution.findOne({
			flat: flatId,
			month: currentMonth,
			year: currentYear,
		});

		if (!contribution) {
			res.status(404).json({
				message: "Couldn't find any contribution for the current month",
			});
			return;
		}

		res.status(200).json(contribution);
	} catch (error: any) {
		console.error("Error fetching current contribution:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

// export const getContributions = async (req: Request, res: Response) => {
// 	try {
// 		let { page = 1, limit = 15, all } = req.query;
// 		if (all === "true") {
// 			const contributions = await Contribution.find()
// 				.populate("flat")
// 				.sort({ year: -1, month: -1 });
// 			res.status(200).json(contributions);
// 			return;
// 		}

// 		page = parseInt(page as string) || 1;
// 		limit = parseInt(limit as string) || 15;

// 		const totalContributions = await Contribution.countDocuments();
// 		const contributions = await Contribution.find()
// 			.populate("flat")
// 			.sort({ year: -1, month: -1 })
// 			.skip((page - 1) * limit)
// 			.limit(limit);

// 		res.status(200).json({
// 			contributions,
// 			totalContributions,
// 			totalPages: Math.ceil(totalContributions / limit),
// 		});
// 	} catch (error: any) {
// 		console.error("Error fetching contributions:", error.message);
// 		res.status(500).json({ message: "Internal server error" });
// 	}
// };

// export const getFlatContributions = async (req: Request, res: Response) => {
// 	try {
// 		const { flatId } = req.params;
// 		if (!flatId) {
// 			res.status(400).json({ message: "Flat ID is required" });
// 			return;
// 		}

// 		let { page = 1, limit = 15, all } = req.query;
// 		if (all === "true") {
// 			const contributions = await Contribution.find({ flat: flatId })
// 				.populate("flat")
// 				.sort({ year: -1, month: -1 });
// 			res.status(200).json(contributions);
// 			return;
// 		}

// 		page = parseInt(page as string) || 1;
// 		limit = parseInt(limit as string) || 15;

// 		const totalContributions = await Contribution.countDocuments({ flat: flatId });
// 		const contributions = await Contribution.find({ flat: flatId })
// 			.populate("flat")
// 			.sort({ year: -1, month: -1 })
// 			.skip((page - 1) * limit)
// 			.limit(limit);

// 		res.status(200).json({
// 			contributions,
// 			totalContributions,
// 			totalPages: Math.ceil(totalContributions / limit),
// 		});
// 	} catch (error: any) {
// 		console.error("Error fetching contributions for this flat:", error.message);
// 		res.status(500).json({ message: "Internal server error" });
// 	}
// };

// export const getBuildingContributions = async (req: Request, res: Response) => {
// 	try {
// 		const { buildingId } = req.params;
// 		if (!buildingId) {
// 			res.status(400).json({ message: "Building ID is required" });
// 			return;
// 		}

// 		let { page = 1, limit = 15, all } = req.query;
// 		page = parseInt(page as string) || 1;
// 		limit = parseInt(limit as string) || 15;

// 		const flats = await Flat.find({ building: buildingId }).select("_id").lean();
// 		if (!flats.length) {
// 			res.status(404).json({ message: "No flats found in this building" });
// 			return;
// 		}
// 		const flatIds = flats.map((f) => f._id);

// 		if (all === "true") {
// 			const contributions = await Contribution.find({ flat: { $in: flatIds } })
// 				.populate("flat")
// 				.sort({ year: -1, month: -1 });
// 			res.status(200).json(contributions);
// 			return;
// 		}

// 		const count = await Contribution.countDocuments({ flat: { $in: flatIds } });
// 		const contributions = await Contribution.find({ flat: { $in: flatIds } })
// 			.populate("flat")
// 			.sort({ year: -1, month: -1 })
// 			.skip((page - 1) * limit)
// 			.limit(limit);

// 		res.status(200).json({
// 			count,
// 			totalPages: Math.ceil(count / limit),
// 			contributions,
// 		});
// 	} catch (error: any) {
// 		console.error("Error fetching building contributions:", error.message);
// 		res.status(500).json({ message: "Internal server error" });
// 	}
// };
