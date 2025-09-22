import { Request, Response } from "express";
import Bill from "../models/bill.model";
import mongoose from "mongoose";

export const createBill = async (req: Request, res: Response) => {
	try {
		const { flatId, month, year, billAmount, paidAmount = 0 } = req.body;
		if (!flatId || !month || !year || !billAmount) {
			res.status(400).json({ message: "Flat ID, bill amount, month and year are required" });
			return;
		}

		const existingBill = await Bill.findOne({
			flat: flatId,
			month,
			year,
		});
		if (existingBill) {
			res.status(400).json({ message: "A bill already exists" });
			return;
		}

		const bill = await Bill.create({
			flat: flatId,
			month,
			year,
			billAmount,
			paidAmount: paidAmount || 0,
		});
		res.status(201).json(bill);
	} catch (error: any) {
		console.error("Error creating bill:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const createBills = async (req: Request, res: Response) => {
	try {
		const { data } = req.body;
		if (!data || data.length === 0 || !Array.isArray(data)) {
			res.status(400).json({ message: "Data is invalid or missing" });
			return;
		}

		const bills = await Bill.insertMany(data, { ordered: false });
		res.status(201).json({ message: "Bills have been created", count: bills.length });
	} catch (error: any) {
		console.error("Error creating bills:", error.message);
		if (error.code === 11000) {
			res.status(400).json({
				message: "Already existing bill(s) found",
				error: error.keyValue,
			});
			return;
		}
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getBills = async (req: Request, res: Response) => {
	try {
		let { page = 1, limit = 15, all } = req.query;
		if (all === "true") {
			const bills = await Bill.find().populate("flat").sort({ year: -1, month: -1 });
			res.status(200).json(bills);
			return;
		}

		page = parseInt(page as string);
		limit = parseInt(limit as string);

		const totalBills = await Bill.countDocuments();
		const bills = await Bill.find()
			.populate("flat")
			.sort({ year: -1, month: -1 })
			.skip((page - 1) * limit)
			.limit(limit);
		res.status(200).json({
			bills,
			totalBills,
			totalPages: Math.ceil(totalBills / limit),
		});
	} catch (error: any) {
		console.error("Error fetching bills:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getFlatBills = async (req: Request, res: Response) => {
	try {
		const { flatId } = req.params;
		let { page = 1, limit = 15, all, unpaid } = req.query;
		if (!flatId) {
			res.status(400).json({ message: "Flat ID is required" });
			return;
		}

		page = parseInt(page as string);
		limit = parseInt(limit as string);

		if (unpaid === "true") {
			if (all === "true") {
				const bills = await Bill.find({
					flat: flatId,
					$expr: {
						$lt: ["$paidAmount", "$billAmount"],
					},
				})
					.populate("flat")
					.sort({ year: -1, month: -1 });
				res.status(200).json(bills);
				return;
			}

			const totalBills = await Bill.countDocuments({
				flat: flatId,
				$expr: {
					$lt: ["$paidAmount", "$billAmount"],
				},
			});
			const bills = await Bill.find({
				flat: flatId,
				$expr: {
					$lt: ["$paidAmount", "$billAmount"],
				},
			})
				.populate("flat")
				.sort({ year: -1, month: -1 })
				.skip((page - 1) * limit)
				.limit(limit);
			res.status(200).json({
				bills,
				totalBills,
				totalPages: Math.ceil(totalBills / limit),
			});
			return;
		}

		if (all === "true") {
			const bills = await Bill.find({ flat: flatId })
				.populate("flat")
				.sort({ year: -1, month: -1 });
			res.status(200).json(bills);
			return;
		}

		const totalBills = await Bill.countDocuments({
			flat: flatId,
		});
		const bills = await Bill.find({
			flat: flatId,
		})
			.populate("flat")
			.sort({ year: -1, month: -1 })
			.skip((page - 1) * limit)
			.limit(limit);
		res.status(200).json({
			bills,
			totalBills,
			totalPages: Math.ceil(totalBills / limit),
		});
	} catch (error: any) {
		console.error("Error fetching bills:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const updateBill = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { flatId, month, year, billAmount, paidAmount } = req.body;

		if (!id) {
			res.status(400).json({ message: "Bill ID is required" });
			return;
		}
		if (!flatId || !month || !year || !billAmount || !paidAmount) {
			res.status(400).json({
				message: "Flat ID, bill amount, month, year and paid amount are required",
			});
			return;
		}

		const existingBill = await Bill.findOne({
			flat: flatId,
			month,
			year,
			_id: { $ne: id },
		});
		if (existingBill) {
			res.status(400).json({ message: "A bill already exists" });
			return;
		}

		const bill = await Bill.findByIdAndUpdate(
			id,
			{
				flat: flatId,
				month,
				year,
				billAmount,
				paidAmount,
			},
			{
				new: true,
			}
		).populate("flat");
		if (!bill) {
			res.status(404).json({ message: "Couldn't find any bill with this ID" });
		}

		res.status(200).json(bill);
	} catch (error: any) {
		console.error("Error updating bills:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteBill = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ message: "Bill ID is required" });
			return;
		}

		const bill = await Bill.findByIdAndDelete(id);
		if (!bill) {
			res.status(404).json({ message: "Couldn't find any bill with this ID" });
			return;
		}

		res.status(200).json({ message: "Bill has been deleted" });
	} catch (error: any) {
		console.error("Error deleting bill:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getFlatBillRemaining = async (req: Request, res: Response) => {
	try {
		const { flatId } = req.params;
		if (!flatId) {
			res.status(400).json({ message: "Flat ID is required" });
		}

		const result = await Bill.aggregate([
			{ $match: { flat: new mongoose.Types.ObjectId(flatId) } },
			{
				$group: {
					_id: "$flat",
					totalRemaining: {
						$sum: { $subtract: ["$billAmount", "$paidAmount"] },
					},
				},
			},
		]);

		const remaining = result.length > 0 ? result[0].totalRemaining : 0;
		res.status(200).json(remaining);
	} catch (error: any) {
		console.error("Error fetching bill remaining:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
