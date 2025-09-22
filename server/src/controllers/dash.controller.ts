import { Request, Response } from "express";
import Flat from "../models/flat.model";
import GasUsage from "../models/gasUsage.model";
import Contribution from "../models/contribution.model";
import ServiceCharge from "../models/serviceCharge.model";
import CylinderPL from "../models/cylinderPL.model";
import CylinderUL from "../models/cylinderUL.model";
import mongoose from "mongoose";

export const getMonthlyBuildingSummary = async (req: Request, res: Response) => {
	try {
		const { buildingId } = req.params;
		const { month, year } = req.query;
		if (!buildingId) {
			res.status(400).json({ message: "Building ID is required" });
			return;
		}

		const currentDate = new Date();
		const selectedMonth = month ? parseInt(month as string, 10) : currentDate.getMonth() + 1;
		const selectedYear = year ? parseInt(year as string, 10) : currentDate.getFullYear();

		if (isNaN(selectedMonth) || isNaN(selectedYear)) {
			res.status(400).json({ message: "Invalid date format" });
			return;
		}

		const flats = await Flat.find({ building: buildingId }).select("_id");
		if (flats.length === 0) {
			res.status(404).json({ message: "Couldn't find any flats in this building" });
			return;
		}

		const flatIds = flats.map((flat) => flat._id);
		const [gasUsageSummary, contributionSummary, serviceChargeSummary, cylinderPL, cylinderUL] =
			await Promise.all([
				GasUsage.aggregate([
					{
						$match: {
							flat: { $in: flatIds },
							month: selectedMonth,
							year: selectedYear,
						},
					},
					{
						$group: {
							_id: null,
							totalUnitsUsed: { $sum: "$unitsUsed" },
							totalBill: { $sum: "$billTotal" },
							paidBill: { $sum: "$billPaid" },
						},
					},
					{
						$project: {
							_id: 0,
							totalUnitsUsed: 1,
							totalBill: 1,
							paidBill: 1,
							remainingBill: { $subtract: ["$totalBill", "$paidBill"] },
						},
					},
				]),
				Contribution.aggregate([
					{
						$match: {
							flat: { $in: flatIds },
							month: selectedMonth,
							year: selectedYear,
						},
					},
					{
						$group: {
							_id: null,
							totalContribution: { $sum: "$amount" },
						},
					},
					{ $project: { _id: 0, totalContribution: 1 } },
				]),
				ServiceCharge.aggregate([
					{
						$match: {
							flat: { $in: flatIds },
							month: selectedMonth,
							year: selectedYear,
						},
					},
					{
						$group: {
							_id: null,
							totalServiceCharge: { $sum: "$amount" },
						},
					},
					{ $project: { _id: 0, totalServiceCharge: 1 } },
				]),
				CylinderPL.findOne({
					building: buildingId,
					month: selectedMonth,
					year: selectedYear,
				}),
				CylinderUL.findOne({
					building: buildingId,
					month: selectedMonth,
					year: selectedYear,
				}),
			]);

		const summary = {
			totalUnitsUsed: gasUsageSummary[0]?.totalUnitsUsed || 0,
			totalBill: gasUsageSummary[0]?.totalBill || 0,
			paidBill: gasUsageSummary[0]?.paidBill || 0,
			remainingBill: gasUsageSummary[0]?.remainingBill || 0,
			totalContribution: contributionSummary[0]?.totalContribution || 0,
			totalServiceCharge: serviceChargeSummary[0]?.totalServiceCharge || 0,
			cylinderPL: cylinderPL || {
				cylindersPurchased: 0,
				cost: 0,
				otherCost: 0,
			},
			cylinderUL: cylinderUL || {
				cylindersUsed: 0,
				unitCost: 0,
				totalCost: 0,
			},
		};
		res.status(200).json(summary);
	} catch (error: any) {
		console.error("Error fetching monthly summary:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

interface ChartMonthData {
	month: number;
	cylindersPurchased: number;
	cylindersUsed: number;
	unitCost: number;
	totalGasBill: number;
}

export const getYearlyBuildingChartData = async (req: Request, res: Response) => {
	try {
		const { buildingId } = req.params;
		const { year } = req.query;

		if (!buildingId) {
			res.status(400).json({ message: "Building ID is required" });
			return;
		}

		const buildingObjectId = new mongoose.Types.ObjectId(buildingId);
		const selectedYear = year ? parseInt(year as string, 10) : new Date().getFullYear();

		if (isNaN(selectedYear)) {
			res.status(400).json({ message: "Invalid year" });
			return;
		}

		const flats = await Flat.find({ building: buildingId }).select("_id");
		if (!flats.length) {
			res.status(404).json({ message: "No flats found for this building" });
			return;
		}
		const flatIds = flats.map((f) => f._id);

		const [purchases, usages, gasBills] = await Promise.all([
			CylinderPL.aggregate([
				{ $match: { building: buildingObjectId, year: selectedYear } },
				{ $project: { month: 1, cylindersPurchased: 1 } },
			]),
			CylinderUL.aggregate([
				{ $match: { building: buildingObjectId, year: selectedYear } },
				{ $project: { month: 1, cylindersUsed: 1, unitCost: 1 } },
			]),
			GasUsage.aggregate([
				{ $match: { flat: { $in: flatIds }, year: selectedYear } },
				{ $group: { _id: "$month", totalBill: { $sum: "$billTotal" } } },
				{ $project: { _id: 0, month: "$_id", totalBill: 1 } },
			]),
		]);

		const purchasesMap = new Map(purchases.map((p) => [p.month, p]));
		const usagesMap = new Map(usages.map((u) => [u.month, u]));
		const gasBillsMap = new Map(gasBills.map((b) => [b.month, b]));

		const cylindersPurchasedData: { month: number; cylindersPurchased: number }[] = [];
		const cylindersUsedData: { month: number; cylindersUsed: number }[] = [];
		const unitCostData: { month: number; unitCost: number }[] = [];
		const totalGasBillData: { month: number; totalGasBill: number }[] = [];

		for (let m = 1; m <= 12; m++) {
			cylindersPurchasedData.push({
				month: m,
				cylindersPurchased: purchasesMap.get(m)?.cylindersPurchased || 0,
			});
			cylindersUsedData.push({
				month: m,
				cylindersUsed: usagesMap.get(m)?.cylindersUsed || 0,
			});
			unitCostData.push({
				month: m,
				unitCost: usagesMap.get(m)?.unitCost || 0,
			});
			totalGasBillData.push({
				month: m,
				totalGasBill: gasBillsMap.get(m)?.totalBill || 0,
			});
		}

		res.json({
			year: selectedYear,
			building: buildingId,
			cylindersPurchasedChart: cylindersPurchasedData,
			cylindersUsedChart: cylindersUsedData,
			unitCostChart: unitCostData,
			totalGasBillChart: totalGasBillData,
		});
	} catch (err: any) {
		console.error("Error fetching chart data:", err.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getMonthlyFlatSummary = async (req: Request, res: Response) => {
	try {
		const { flatId } = req.params;
		const { month, year } = req.query;
		if (!flatId) {
			res.status(400).json({ message: "Flat ID is required" });
			return;
		}

		const flatObjectId = new mongoose.Types.ObjectId(flatId);

		const currentDate = new Date();
		const selectedMonth = month ? parseInt(month as string, 10) : currentDate.getMonth() + 1;
		const selectedYear = year ? parseInt(year as string, 10) : currentDate.getFullYear();

		if (isNaN(selectedMonth) || isNaN(selectedYear)) {
			res.status(400).json({ message: "Invalid date format" });
			return;
		}

		const [totalRemainingBill, gasUsage, contribution, serviceCharge] = await Promise.all([
			GasUsage.aggregate([
				{
					$match: {
						flat: flatObjectId,
					},
				},
				{
					$group: {
						_id: null,
						totalBill: { $sum: "$billTotal" },
						paidBill: { $sum: "$billPaid" },
					},
				},
				{
					$project: {
						_id: 0,
						totalBill: 1,
						paidBill: 1,
						remainingBill: { $subtract: ["$totalBill", "$paidBill"] },
					},
				},
			]),
			GasUsage.findOne({
				flat: flatObjectId,
				month: selectedMonth,
				year: selectedYear,
			}),
			Contribution.findOne({
				flat: flatObjectId,
				month: selectedMonth,
				year: selectedYear,
			}),
			ServiceCharge.findOne({
				flat: flatObjectId,
				month: selectedMonth,
				year: selectedYear,
			}),
		]);

		const summary = {
			totalRemainingBill: totalRemainingBill[0]?.remainingBill || 0,
			gasUsage: gasUsage || {
				unitReadout: 0,
				unitsUsed: 0,
				unitCost: 0,
				billTotal: 0,
				billPaid: 0,
			},
			contribution: contribution || {
				amount: 0,
			},
			serviceCharge: serviceCharge || {
				amount: 0,
			},
		};
		res.status(200).json(summary);
	} catch (err: any) {
		console.error("Error fetching monthly flat summary:", err.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getYearlyFlatChartData = async (req: Request, res: Response) => {
	try {
		const { flatId } = req.params;
		const { year } = req.query;

		if (!flatId) {
			res.status(400).json({ message: "Flat ID is required" });
			return;
		}

		const flatObjectId = new mongoose.Types.ObjectId(flatId);

		const selectedYear = year ? parseInt(year as string, 10) : new Date().getFullYear();
		if (isNaN(selectedYear)) {
			res.status(400).json({ message: "Invalid year" });
			return;
		}

		const gasUsage = await GasUsage.aggregate([
			{
				$match: {
					flat: flatObjectId,
					year: selectedYear,
				},
			},
			{
				$group: {
					_id: "$month",
					unitsUsed: { $sum: "$unitsUsed" },
					billTotal: { $sum: "$billTotal" },
				},
			},
			{
				$project: {
					_id: 0,
					month: "$_id",
					unitsUsed: 1,
					billTotal: 1,
				},
			},
			{ $sort: { month: 1 } },
		]);

		const unitsUsedChart: { month: number; unitsUsed: number }[] = [];
		const billTotalChart: { month: number; billTotal: number }[] = [];

		for (let m = 1; m <= 12; m++) {
			const data = gasUsage.find((g) => g.month === m);
			unitsUsedChart.push({ month: m, unitsUsed: data?.unitsUsed || 0 });
			billTotalChart.push({ month: m, billTotal: data?.billTotal || 0 });
		}

		res.json({
			unitsUsedChart,
			billTotalChart,
		});
	} catch (error: any) {
		console.error("Error fetching gas usage charts:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};
