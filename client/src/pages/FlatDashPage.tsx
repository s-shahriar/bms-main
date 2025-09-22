import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";
import { toast } from "sonner";
import HeaderFlat from "@/components/HeaderFlat";
import Footer from "@/components/Footer";
import { MONTHS } from "@/lib/constants";
import { flatAuthCheckApi } from "@/api/authApi";
import { fetchMonthlyFlatSummaryApi, fetchYearlyFlatChartDataApi } from "@/api/dashApi";

const unitsUsedChartConfig = {
	unitsUsed: {
		label: "Units Used",
		color: "crimson",
	},
} satisfies ChartConfig;

const billTotalChartConfig = {
	billTotal: {
		label: "Total Bill",
		color: "dodgerblue",
	},
} satisfies ChartConfig;

const FlatDashPage: React.FC = () => {
	const [isPageloading, setIsPageLoading] = useState(true);
	const [flat, setFlat] = useState<any>(null);
	const [monthlySummary, setMonthlySummary] = useState<any>(null);
	const [chartData, setChartData] = useState<any>(null);
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
	const navigate = useNavigate();

	const fetchMonthlyFlatSummary = async () => {
		const response = await fetchMonthlyFlatSummaryApi(flat._id);
		if (response.success) {
			setMonthlySummary(response.data);
		} else {
			toast("Failed to fetch flat monthly summary", {
				description:
					response.error || "Some error is preventing summary from being fetched",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
		}
	};

	const fetchYearlyFlatChartData = async () => {
		const response = await fetchYearlyFlatChartDataApi(flat._id);
		if (response.success) {
			setChartData(response.data);
			console.log(response.data);
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
		const flatAuthCheck = async () => {
			const response = await flatAuthCheckApi();
			if (response.success) {
				setFlat(response.data.flat);
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

		flatAuthCheck();
	}, [navigate]);

	useEffect(() => {
		if (flat) {
			fetchMonthlyFlatSummary();
			fetchYearlyFlatChartData();
		}
	}, [flat]);

	return (
		<>
			<main className="flex flex-col min-h-screen gap-6">
				<HeaderFlat />
				<Card className="flex grow container mx-auto">
					<CardHeader>
						<CardTitle className="text-2xl">
							{flat && flat.flatNumber} Flat Resident Dashboard
						</CardTitle>
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
														Unit Readout
													</TableCell>
													<TableCell>
														{monthlySummary.gasUsage.unitReadout.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														This Month's Units Used
													</TableCell>
													<TableCell>
														{monthlySummary.gasUsage.unitsUsed.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														This Month's Unit Cost
													</TableCell>
													<TableCell>
														{monthlySummary.gasUsage.unitCost.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														This Month's Bill
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.gasUsage.billTotal.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Paid Bill
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.gasUsage.billPaid.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Total Remaining Bill
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.totalRemainingBill.toLocaleString(
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
														Service Charge
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.serviceCharge.amount.toLocaleString(
															"en-IN"
														)}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-semibold">
														Mosque Contribution
													</TableCell>
													<TableCell>
														&#x09F3;{" "}
														{monthlySummary.contribution.amount.toLocaleString(
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
										<CardTitle>Units Used Chart</CardTitle>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={unitsUsedChartConfig}
											className="min-h-[200px] max-h-[400px] w-full"
										>
											<BarChart
												accessibilityLayer
												data={chartData.unitsUsedChart}
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
													dataKey="unitsUsed"
													fill="var(--color-unitsUsed)"
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
											config={billTotalChartConfig}
											className="min-h-[200px] max-h-[400px] w-full"
										>
											<BarChart
												accessibilityLayer
												data={chartData.billTotalChart}
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
													dataKey="billTotal"
													fill="var(--color-billTotal)"
													radius={4}
												/>
											</BarChart>
										</ChartContainer>
									</CardContent>
								</Card>
							</div>
						)}
					</CardContent>
					<CardFooter></CardFooter>
				</Card>
				<Footer />
			</main>
		</>
	);
};

export default FlatDashPage;
