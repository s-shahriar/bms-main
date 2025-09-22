import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import HeaderAdmin from "@/components/HeaderAdmin";
import Footer from "@/components/Footer";
import { MONTHS } from "@/lib/constants";
import { toast } from "sonner";
import { adminAuthCheckApi } from "@/api/authApi";
import { fetchBuildingsApi } from "@/api/buildingApi";
import { fetchMonthlyBuildingSummaryApi, fetchYearlyBuildingChartDataApi } from "@/api/dashApi";

const cylindersPurchasedChartConfig = {
	cylindersPurchased: {
		label: "Cylinders Purchased",
		color: "crimson",
	},
} satisfies ChartConfig;

const cylindersUsedChartConfig = {
	cylindersUsed: {
		label: "Cylinders Used",
		color: "#60a5fa",
	},
} satisfies ChartConfig;

const unitCostChartConfig = {
	unitCost: {
		label: "Unit Cost",
		color: "cadetblue",
	},
} satisfies ChartConfig;

const totalGasBillChartConfig = {
	totalGasBill: {
		label: "Total Bill",
		color: "dodgerblue",
	},
} satisfies ChartConfig;

const AdminDashPage: React.FC = () => {
	const [isPageloading, setIsPageLoading] = useState(true);
	const [buildings, setBuildings] = useState([]);
	const [currentBuildingId, setCurrentBuildingId] = useState<string | null>(null);
	const [monthlySummary, setMonthlySummary] = useState<any>(null);
	const [chartData, setChartData] = useState<any>(null);
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
	const navigate = useNavigate();

	const fetchMonthlyBuildingSummary = async () => {
		const response = await fetchMonthlyBuildingSummaryApi(currentBuildingId as string);
		if (response.success) {
			setMonthlySummary(response.data);
		} else {
			toast("Failed to fetch building monthly summary", {
				description:
					response.error || "Some error is preventing summary from being fetched",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
		}
	};

	const fetchYearlyBuildingChartData = async () => {
		const response = await fetchYearlyBuildingChartDataApi(currentBuildingId as string);
		if (response.success) {
			setChartData(response.data);
		} else {
			toast("Failed to fetch building chart data", {
				description: response.error || "Some error is preventing data from being fetched",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
		}
	};

	useEffect(() => {
		const adminAuthCheck = async () => {
			const response = await adminAuthCheckApi();
			if (response.success) {
				setIsPageLoading(false);
			} else {
				toast("Unauthorized", {
					description: "Please sign in again",
					action: {
						label: "OK",
						onClick: () => {},
					},
				});
				navigate("/sign-in");
			}
		};

		const fetchBuildings = async () => {
			const response = await fetchBuildingsApi();
			if (response.success) {
				setBuildings(response.data);
			} else {
				toast("Failed to fetch buildings", {
					description:
						response.error || "Some error is preventing buildings from being fetched",
					action: {
						label: "OK",
						onClick: () => {},
					},
				});
			}
		};

		adminAuthCheck();
		fetchBuildings();
	}, [navigate]);

	useEffect(() => {
		if (buildings.length > 0) {
			const firstBuilding: any = buildings[0];
			setCurrentBuildingId(firstBuilding._id);
		}
	}, [buildings]);

	useEffect(() => {
		if (currentBuildingId) {
			fetchMonthlyBuildingSummary();
			fetchYearlyBuildingChartData();
		}
	}, [currentBuildingId]);

	return (
		<>
			<main className="flex flex-col min-h-screen gap-6">
				<HeaderAdmin />
				<Card className="flex grow container mx-auto">
					<CardHeader>
						<CardTitle className="text-2xl">Admin Dashboard</CardTitle>
						<CardDescription>{MONTHS[currentMonth]}</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-6">
						{monthlySummary && (
							<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Gas Usage Summary</CardTitle>
									</CardHeader>
									<CardContent>
										<Table>
											<TableBody>
												<TableRow>
													<TableCell className="font-semibold">
														Total Bill
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.totalBill.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Collected Bill
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.paidBill.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Remaining Bill
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.remainingBill.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle>Service Charge & Contribution Summary</CardTitle>
									</CardHeader>
									<CardContent>
										<Table>
											<TableBody>
												<TableRow>
													<TableCell className="font-semibold">
														Total Service Charge Collected
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.totalServiceCharge.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Total Mosque Contribution Collected
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.totalContribution.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle>Cylinder Purchase Summary</CardTitle>
									</CardHeader>
									<CardContent>
										<Table>
											<TableBody>
												<TableRow>
													<TableCell className="font-semibold">
														Cylinders Purchased
													</TableCell>
													<TableCell>
														{
															monthlySummary.cylinderPL
																.cylindersPurchased
														}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Cost
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.cylinderPL.cost.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Other Cost
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.cylinderPL.otherCost.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle>Cylinder Usage Summary</CardTitle>
									</CardHeader>
									<CardContent>
										<Table>
											<TableBody>
												<TableRow>
													<TableCell className="font-semibold">
														Cylinders Used
													</TableCell>
													<TableCell>
														{monthlySummary.cylinderUL.cylindersUsed}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Unit Cost
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.cylinderUL.unitCost.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Total Cost
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.cylinderUL.totalCost.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							</div>
						)}
						{chartData && (
							<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Cylinders Purchased Chart</CardTitle>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={cylindersPurchasedChartConfig}
											className="min-h-[200px] max-h-[400px] w-full"
										>
											<BarChart
												accessibilityLayer
												data={chartData.cylindersPurchasedChart}
											>
												<CartesianGrid vertical={false} />
												<XAxis
													dataKey="month"
													tickLine={false}
													tickMargin={10}
													axisLine={false}
													tickFormatter={(value) =>
														MONTHS[value - 1].slice(0, 3)
													}
												/>
												<ChartTooltip content={<ChartTooltipContent />} />
												<Bar
													dataKey="cylindersPurchased"
													fill="var(--color-cylindersPurchased)"
													radius={4}
												/>
											</BarChart>
										</ChartContainer>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle>Cylinders Used Chart</CardTitle>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={cylindersUsedChartConfig}
											className="min-h-[200px] max-h-[400px] w-full"
										>
											<BarChart
												accessibilityLayer
												data={chartData.cylindersUsedChart}
											>
												<CartesianGrid vertical={false} />
												<XAxis
													dataKey="month"
													tickLine={false}
													tickMargin={10}
													axisLine={false}
													tickFormatter={(value) =>
														MONTHS[value - 1].slice(0, 3)
													}
												/>
												<ChartTooltip content={<ChartTooltipContent />} />
												<Bar
													dataKey="cylindersUsed"
													fill="var(--color-cylindersUsed)"
													radius={4}
												/>
											</BarChart>
										</ChartContainer>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle>Unit Cost Chart</CardTitle>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={unitCostChartConfig}
											className="min-h-[200px] max-h-[400px] w-full"
										>
											<BarChart
												accessibilityLayer
												data={chartData.unitCostChart}
											>
												<CartesianGrid vertical={false} />
												<XAxis
													dataKey="month"
													tickLine={false}
													tickMargin={10}
													axisLine={false}
													tickFormatter={(value) =>
														MONTHS[value - 1].slice(0, 3)
													}
												/>
												<ChartTooltip content={<ChartTooltipContent />} />
												<Bar
													dataKey="unitCost"
													fill="var(--color-unitCost)"
													radius={4}
												/>
											</BarChart>
										</ChartContainer>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle>Total Bill Chart</CardTitle>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={totalGasBillChartConfig}
											className="min-h-[200px] max-h-[400px] w-full"
										>
											<BarChart
												accessibilityLayer
												data={chartData.totalGasBillChart}
											>
												<CartesianGrid vertical={false} />
												<XAxis
													dataKey="month"
													tickLine={false}
													tickMargin={10}
													axisLine={false}
													tickFormatter={(value) =>
														MONTHS[value - 1].slice(0, 3)
													}
												/>
												<ChartTooltip content={<ChartTooltipContent />} />
												<Bar
													dataKey="totalGasBill"
													fill="var(--color-totalGasBill)"
													radius={4}
												/>
											</BarChart>
										</ChartContainer>
									</CardContent>
								</Card>
							</div>
						)}
					</CardContent>
				</Card>
				<Footer />
			</main>
		</>
	);
};

export default AdminDashPage;
