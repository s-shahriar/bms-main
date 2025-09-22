import { Request, Response } from "express";
import CylinderUL from "../models/cylinderUL.model";

export const createCylinderUL = async (req: Request, res: Response) => {
	try {
		const { buildingId, month, year, cylindersUsed, unitCost } = req.body;
		if (!buildingId || !month || !year || !cylindersUsed || !unitCost) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingcylinderUL = await CylinderUL.findOne({
			building: buildingId,
			month,
			year,
		});
		if (existingcylinderUL) {
			res.status(409).json({ message: "A cylinder usage log already exists" });
			return;
		}

		const totalCost = cylindersUsed * unitCost;
		await CylinderUL.create({
			building: buildingId,
			month,
			year,
			cylindersUsed,
			unitCost,
			totalCost,
		});
		res.status(201).json({ message: "Cylinder usage log has been created" });
	} catch (error: any) {
		console.error("Error creating cylinder usage log:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getBuildingCylinderULs = async (req: Request, res: Response) => {
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

		const cylinderULs = await CylinderUL.find({ building: buildingId, ...rangeQuery })
			.populate("building")
			.sort({ year: -1, month: -1 });

		res.status(200).json(cylinderULs);
	} catch (error: any) {
		console.error("Error fetching cylinder usage logs:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const updateCylinderUL = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Cylinder usage log ID is required" });
			return;
		}

		const { buildingId, month, year, cylindersUsed, unitCost } = req.body;
		if (!buildingId || !month || !year || !cylindersUsed || !unitCost) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingcylinderUL = await CylinderUL.findOne({
			_id: { $ne: id },
			building: buildingId,
			month,
			year,
		});
		if (existingcylinderUL) {
			res.status(409).json({ message: "A cylinder usage log already exists" });
			return;
		}

		const totalCost = cylindersUsed * unitCost;
		const cylinderUL = await CylinderUL.findByIdAndUpdate(
			id,
			{
				building: buildingId,
				month,
				year,
				cylindersUsed,
				unitCost,
				totalCost,
			},
			{ new: true }
		);
		if (!cylinderUL) {
			res.status(404).json({
				message: "Couldn't find any cylinder usage log with this ID",
			});
			return;
		}
		res.status(200).json(cylinderUL);
	} catch (error: any) {
		console.error("Error updating cylinder usage log:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteCylinderUL = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Cylinder usage log ID is required" });
			return;
		}

		const cylinderUL = await CylinderUL.findByIdAndDelete(id);
		if (!cylinderUL) {
			res.status(404).json({
				message: "Couldn't find any cylinder usage log with this ID",
			});
			return;
		}

		res.status(200).json({ message: "Cylinder usage log has been deleted" });
	} catch (error: any) {
		console.error("Error deleting cylinder usage log:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
