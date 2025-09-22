import { Request, Response } from "express";
import GasUsage from "../models/gasUsage.model";
import Flat from "../models/flat.model";

export const createGasUsage = async (req: Request, res: Response) => {
	try {
		const { flatId, month, year, unitReadout, unitCost, billPaid = 0 } = req.body;
		if (!flatId || !month || !year || unitReadout === undefined || unitCost === undefined) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingGasUsage = await GasUsage.findOne({
			flat: flatId,
			month,
			year,
		});
		if (existingGasUsage) {
			res.status(409).json({ message: "A gas usage record already exists" });
			return;
		}

		let prevMonth = month - 1;
		let prevYear = year;
		if (prevMonth === 0) {
			prevMonth = 12;
			prevYear = year - 1;
		}

		const prevGasUsage = await GasUsage.findOne({
			flat: flatId,
			month: prevMonth,
			year: prevYear,
		});
		const prevUnitReadout = prevGasUsage ? prevGasUsage.unitReadout : 0;
		if (unitReadout < prevUnitReadout) {
			res.status(400).json({
				message: "Unit readout can't be lower than previous month's readout",
			});
			return;
		}

		const unitsUsed = unitReadout - prevUnitReadout;
		const billTotal = Math.ceil(unitsUsed * unitCost);
		const billCapped = Math.min(billPaid, billTotal);

		const gasUsage = await GasUsage.create({
			flat: flatId,
			month,
			year,
			unitReadout,
			unitCost,
			unitsUsed,
			billTotal,
			billPaid: billCapped,
		});
		res.status(201).json({ message: "Gas usage record has been created", data: gasUsage });
	} catch (error: any) {
		console.error("Error creating gas usage record:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const createMultipleGasUsages = async (req: Request, res: Response) => {
	try {
		const { data } = req.body;
		if (!Array.isArray(data) || data.length === 0) {
			res.status(400).json({ message: "Data is invalid or missing" });
			return;
		}

		let count = 0;
		const errors: string[] = [];

		for (const [index, item] of data.entries()) {
			const { flatId, month, year, unitReadout, unitCost, billPaid = 0 } = item;
			if (!flatId || !month || !year || unitReadout === undefined || unitCost === undefined) {
				errors.push(`Entry ${index + 1}: Data is missing`);
				continue;
			}

			const existingGasUsage = await GasUsage.findOne({
				flat: flatId,
				month,
				year,
			}).populate("flat");
			if (existingGasUsage) {
				errors.push(
					`Entry ${index + 1}: A gas usage record already exists for ${
						existingGasUsage.flat.flatName
					} flat`
				);
				continue;
			}

			let prevMonth = month - 1;
			let prevYear = year;
			if (prevMonth === 0) {
				prevMonth = 12;
				prevYear = year - 1;
			}

			const prevGasUsage = await GasUsage.findOne({
				flat: flatId,
				month: prevMonth,
				year: prevYear,
			});
			const prevUnitReadout = prevGasUsage ? prevGasUsage.unitReadout : 0;
			if (unitReadout < prevUnitReadout) {
				errors.push(
					`Entry ${index + 1}: Unit readout can't be lower than previous month's readout`
				);
				continue;
			}

			const unitsUsed = unitReadout - prevUnitReadout;
			const billTotal = Math.ceil(unitsUsed * unitCost);
			const billCapped = Math.min(billPaid, billTotal);

			await GasUsage.create({
				flat: flatId,
				month,
				year,
				unitReadout,
				unitCost,
				unitsUsed,
				billTotal,
				billPaid: billCapped,
			});
			count++;
		}

		res.status(201).json({
			message: `${count} gas usage records have been created`,
			errors,
		});
	} catch (error: any) {
		console.error("Error creating multiple gas usage records:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getBuildingGasUsages = async (req: Request, res: Response) => {
	try {
		const { buildingId } = req.params;
		const { starting, ending, status } = req.query;
		if (!buildingId || !starting || !ending) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const [startingYear, startingMonth] = (starting as string).split("-").map(Number);
		const [endingYear, endingMonth] = (ending as string).split("-").map(Number);

		const startValue = startingYear * 100 + startingMonth;
		const endValue = endingYear * 100 + endingMonth;

		const rangeQuery: any = {
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

		if (status === "true") {
			rangeQuery.status = true;
		} else if (status === "false") {
			rangeQuery.status = false;
		}

		const flatIds = await Flat.find({ building: buildingId }).select("_id");
		const gasUsages = await GasUsage.find({ flat: { $in: flatIds }, ...rangeQuery })
			.populate("flat")
			.sort({ year: -1, month: -1 });

		res.status(200).json(gasUsages);
	} catch (error: any) {
		console.error("Error fetching building gas usage records:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getFlatGasUsages = async (req: Request, res: Response) => {
	try {
		const { flatId } = req.params;
		const { starting, ending, status } = req.query;
		if (!flatId || !starting || !ending) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const [startingYear, startingMonth] = (starting as string).split("-").map(Number);
		const [endingYear, endingMonth] = (ending as string).split("-").map(Number);

		const startValue = startingYear * 100 + startingMonth;
		const endValue = endingYear * 100 + endingMonth;

		const rangeQuery: any = {
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

		if (status === "true") {
			rangeQuery.status = true;
		} else if (status === "false") {
			rangeQuery.status = false;
		}

		const gasUsages = await GasUsage.find({ flat: flatId, ...rangeQuery })
			.populate("flat")
			.sort({ year: -1, month: -1 });

		res.status(200).json(gasUsages);
	} catch (error: any) {
		console.error("Error fetching flat gas usage records:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const updateGasUsage = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Gas usage record ID is required" });
			return;
		}

		const { flatId, month, year, unitReadout, unitCost, billPaid } = req.body;
		if (
			!flatId ||
			!month ||
			!year ||
			unitReadout === undefined ||
			unitCost === undefined ||
			billPaid === undefined
		) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingGasUsage = await GasUsage.findOne({
			_id: { $ne: id },
			flat: flatId,
			month,
			year,
		});
		if (existingGasUsage) {
			res.status(409).json({ message: "A gas usage record already exists" });
			return;
		}

		let prevMonth = month - 1;
		let prevYear = year;
		if (prevMonth === 0) {
			prevMonth = 12;
			prevYear = year - 1;
		}

		const prevGasUsage = await GasUsage.findOne({
			flat: flatId,
			month: prevMonth,
			year: prevYear,
		});
		const prevUnitReadout = prevGasUsage ? prevGasUsage.unitReadout : 0;
		if (unitReadout < prevUnitReadout) {
			res.status(400).json({
				message: "Unit readout can't be lower than previous month's readout",
			});
			return;
		}

		const unitsUsed = unitReadout - prevUnitReadout;
		const billTotal = Math.ceil(unitsUsed * unitCost);
		const billCapped = Math.min(billPaid, billTotal);

		const gasUsage = await GasUsage.findByIdAndUpdate(
			id,
			{
				flat: flatId,
				month,
				year,
				unitReadout,
				unitCost,
				unitsUsed,
				billTotal,
				billPaid: billCapped,
			},
			{ new: true }
		);
		if (!gasUsage) {
			res.status(404).json({ message: "Couldn't find any gas usage record with this ID" });
			return;
		}
		res.status(200).json({ message: "Gas usage record has been updated", data: gasUsage });
	} catch (error: any) {
		console.error("Error updating gas usage record:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const updateMultipleGasUsages = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Gas usage record ID is required" });
			return;
		}

		const { data } = req.body;
		if (!Array.isArray(data) || data.length === 0) {
			res.status(400).json({ message: "Data is invalid or missing" });
			return;
		}

		let count = 0;
		const errors: string[] = [];

		for (const [index, item] of data.entries()) {
			const { flatId, month, year, unitReadout, unitCost, billPaid } = item;
			if (
				!flatId ||
				!month ||
				!year ||
				unitReadout === undefined ||
				unitCost === undefined ||
				billPaid === undefined
			) {
				errors.push(`Entry ${index + 1}: Data is missing`);
				continue;
			}

			const existingGasUsage = await GasUsage.findOne({
				_id: { $ne: id },
				flat: flatId,
				month,
				year,
			}).populate("flat");
			if (existingGasUsage) {
				errors.push(
					`Entry ${index + 1}: A gas usage record already exists for ${
						existingGasUsage.flat.flatName
					} flat`
				);
				continue;
			}

			let prevMonth = month - 1;
			let prevYear = year;
			if (prevMonth === 0) {
				prevMonth = 12;
				prevYear = year - 1;
			}

			const prevGasUsage = await GasUsage.findOne({
				flat: flatId,
				month: prevMonth,
				year: prevYear,
			});
			const prevUnitReadout = prevGasUsage ? prevGasUsage.unitReadout : 0;
			if (unitReadout < prevUnitReadout) {
				errors.push(
					`Entry ${index + 1}: Unit readout can't be lower than previous month's readout`
				);
				continue;
			}

			const unitsUsed = unitReadout - prevUnitReadout;
			const billTotal = Math.ceil(unitsUsed * unitCost);
			const billCapped = Math.min(billPaid, billTotal);

			const gasUsage = await GasUsage.findByIdAndUpdate(
				id,
				{
					flat: flatId,
					month,
					year,
					unitReadout,
					unitCost,
					unitsUsed,
					billTotal,
					billPaid: billCapped,
				},
				{ new: true }
			);
			if (!gasUsage) {
				errors.push(`Entry ${index + 1}: Couldn't find any gas usage with this ID`);
				continue;
			}
			count++;
		}

		res.status(200).json({
			message: `${count} gas usage records have been updated`,
			errors,
		});
	} catch (error: any) {
		console.error("Error updating multiple gas usage records:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteGasUsage = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Gas usage record ID is required" });
			return;
		}

		const gasUsage = await GasUsage.findByIdAndDelete(id);
		if (!gasUsage) {
			res.status(404).json({ message: "Couldn't find any gas usage record with this ID" });
			return;
		}
		res.status(200).json({ message: "Gas usage record has been deleted" });
	} catch (error: any) {
		console.error("Error deleting gas usage record:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

// export const getFlatBillReamining = async (req: Request, res: Response) => {
// 	try {
// 		const { flatId } = req.params;

// 		if (!flatId) {
// 			res.status(400).json({ message: "Flat ID is required" });
// 			return;
// 		}

// 		const gasUsages = await GasUsage.find({ flat: flatId });
// 		if (!gasUsages || gasUsages.length === 0) {
// 			res.status(404).json({
// 				message: "Couldn't find any gas usage record with this flat ID",
// 			});
// 			return;
// 		}

// 		const remainingBill = gasUsages.reduce((sum, gasUsage) => {
// 			const remaining = (gasUsage.billTotal || 0) - (gasUsage.billPaid || 0);
// 			return sum + remaining;
// 		}, 0);
// 		res.status(200).json(remainingBill);
// 	} catch (error: any) {
// 		console.error("Error fetching flat bill remaining:", error.message);
// 		res.status(500).json({ message: "Internal server error" });
// 	}
// };

// export const getFlatGasUsages = async (req: Request, res: Response) => {
// 	try {
// 		const { flatId } = req.params;
// 		if (!flatId) {
// 			res.status(400).json({ message: "Flat ID is required" });
// 			return;
// 		}

// 		let { page = 1, limit = 15, all } = req.query;

// 		if (all === "true") {
// 			const gasUsages = await GasUsage.find({ flat: flatId })
// 				.populate("flat")
// 				.sort({ year: -1, month: -1 });
// 			res.status(200).json({ count: gasUsages.length, totalPages: 1, gasUsages });
// 			return;
// 		}

// 		page = parseInt(page as string) || 1;
// 		limit = parseInt(limit as string) || 15;

// 		const count = await GasUsage.countDocuments({ flat: flatId });
// 		const gasUsages = await GasUsage.find({ flat: flatId })
// 			.populate("flat")
// 			.sort({ year: -1, month: -1 })
// 			.skip((page - 1) * limit)
// 			.limit(limit);
// 		res.status(200).json({
// 			count,
// 			totalPages: Math.ceil(count / limit),
// 			gasUsages,
// 		});
// 	} catch (error: any) {
// 		console.error("Error fetching flat gas usage records:", error.message);
// 		res.status(500).json({ message: "Internal server error" });
// 	}
// };

// export const getBuildingBillReamining = async (req: Request, res: Response) => {
// 	try {
// 		const { buildingId } = req.params;
// 		if (!buildingId) {
// 			res.status(400).json({ message: "Building ID is required" });
// 			return;
// 		}

// 		const currentDate = new Date();
// 		const month = currentDate.getMonth() + 1;
// 		const year = currentDate.getFullYear();

// 		const flats = await Flat.find({ building: buildingId }).select("_id").lean();
// 		if (flats.length === 0) {
// 			res.status(404).json({ message: "No flats found in this building" });
// 			return;
// 		}
// 		const flatIds = flats.map((flat) => flat._id);

// 		const gasUsages = await GasUsage.aggregate([
// 			{ $match: { flat: { $in: flatIds }, month, year } },
// 			{
// 				$group: {
// 					_id: null,
// 					billTotals: { $sum: "$billTotal" },
// 					billPaids: { $sum: "$billPaid" },
// 				},
// 			},
// 		]);

// 		if (!gasUsages.length) {
// 			res.status(404).json({
// 				message: "No gas usages found for this building in the current month",
// 			});
// 			return;
// 		}

// 		res.status(200).json({
// 			billTotal: gasUsages[0].billTotals || 0,
// 			billPaid: gasUsages[0].billPaids || 0,
// 			remainingBill: (gasUsages[0].billTotals || 0) - (gasUsages[0].billPaids || 0),
// 		});
// 	} catch (error: any) {
// 		console.error("Error fetching building bill remaining:", error.message);
// 		res.status(500).json({ message: "Internal server error" });
// 	}
// };
