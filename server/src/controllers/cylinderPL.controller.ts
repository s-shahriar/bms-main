import { Request, Response } from "express";
import CylinderPL from "../models/cylinderPL.model";

export const createCylinderPL = async (req: Request, res: Response) => {
	try {
		const {
			buildingId,
			month,
			year,
			cylindersPurchased,
			dealer,
			cost,
			otherCost = 0,
		} = req.body;
		if (!buildingId || !month || !year || !cylindersPurchased || !cost) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingcylinderPL = await CylinderPL.findOne({
			building: buildingId,
			month,
			year,
		});
		if (existingcylinderPL) {
			res.status(409).json({ message: "A cylinder purchase log already exists" });
			return;
		}

		await CylinderPL.create({
			building: buildingId,
			month,
			year,
			cylindersPurchased,
			dealer,
			cost,
			otherCost: otherCost || 0,
		});
		res.status(201).json({ message: "Cylinder purchase log has been created" });
	} catch (error: any) {
		console.error("Error creating cylinder purchase log:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getBuildingCylinderPLs = async (req: Request, res: Response) => {
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

		const cylinderPLs = await CylinderPL.find({ building: buildingId, ...rangeQuery })
			.populate("building")
			.sort({ year: -1, month: -1 });

		res.status(200).json(cylinderPLs);
	} catch (error: any) {
		console.error("Error fetching cylinder purchase logs:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const updateCylinderPL = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Cylinder purchase log ID is required" });
			return;
		}

		const {
			buildingId,
			month,
			year,
			cylindersPurchased,
			dealer,
			cost,
			otherCost = 0,
		} = req.body;
		if (!buildingId || !month || !year || !cylindersPurchased || !cost) {
			res.status(400).json({ message: "Data is missing" });
			return;
		}

		const existingcylinderPL = await CylinderPL.findOne({
			_id: { $ne: id },
			building: buildingId,
			month,
			year,
		});
		if (existingcylinderPL) {
			res.status(409).json({ message: "A cylinder purchase log already exists" });
			return;
		}

		const cylinderPL = await CylinderPL.findByIdAndUpdate(
			id,
			{
				building: buildingId,
				month,
				year,
				cylindersPurchased,
				dealer,
				cost,
				otherCost,
			},
			{ new: true }
		);
		if (!cylinderPL) {
			res.status(404).json({
				message: "Couldn't find any cylinder purchase log with this ID",
			});
			return;
		}
		res.status(200).json(cylinderPL);
	} catch (error: any) {
		console.error("Error updating cylinder purchase log:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteCylinderPL = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Cylinder purchase log ID is required" });
			return;
		}

		const cylinderPL = await CylinderPL.findByIdAndDelete(id);
		if (!cylinderPL) {
			res.status(404).json({
				message: "Couldn't find any cylinder purchase log with this ID",
			});
			return;
		}

		res.status(200).json({ message: "Cylinder purchase log has been deleted" });
	} catch (error: any) {
		console.error("Error deleting cylinder purchase log:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
