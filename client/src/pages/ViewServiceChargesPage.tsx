import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogClose,
	DialogContent,
	// DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	// DialogTrigger,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { MONTHS } from "@/lib/constants";
import { toast } from "sonner";
import HeaderFlat from "@/components/HeaderFlat";
import Footer from "@/components/Footer";
import { flatAuthCheckApi } from "@/api/authApi";
import { fetchFlatServiceChargesApi } from "@/api/serviceChargeApi";

const ViewServiceChargesPage: React.FC = () => {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [flat, setFlat] = useState<any>(null);
	const [serviceCharges, setServiceCharges] = useState([]);
	const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
	const tableRef = useRef<HTMLTableElement>(null);
	const currentDate = new Date();
	const [tableFilters, setTableFilters] = useState({
		starting: `${currentDate.getFullYear()}-01`,
		ending: currentDate.toISOString().slice(0, 7),
	});
	const navigate = useNavigate();

	const fetchFlatServiceCharges = async () => {
		const response = await fetchFlatServiceChargesApi(
			flat._id,
			tableFilters.starting,
			tableFilters.ending
		);
		if (response.success) {
			setServiceCharges(response.data);
		} else {
			toast("Failed to fetch service charges", {
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
			fetchFlatServiceCharges();
		}
	}, [flat]);

	const handleDownloadPDF = async () => {
		if (!tableRef.current) return;

		const imgData = await toPng(tableRef.current, { cacheBust: true });

		const pdf = new jsPDF("p", "mm", "a4");
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = pdf.internal.pageSize.getHeight();

		const img = new Image();
		img.src = imgData;
		img.onload = () => {
			const imgWidth = pdfWidth;
			const imgHeight = (img.height * imgWidth) / img.width;

			let heightLeft = imgHeight;
			let position = 0;

			pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
			heightLeft -= pdfHeight;

			while (heightLeft > 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
				heightLeft -= pdfHeight;
			}

			pdf.save("table.pdf");
		};
	};

	return (
		<main className="flex flex-col min-h-screen gap-6">
			<HeaderFlat />
			<Card className="flex grow container mx-auto">
				<CardHeader>
					<CardTitle className="text-2xl">
						{flat && flat.flatNumber} Flat Service Charges
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-6">
					<Card className="">
						<CardHeader className="">
							<CardTitle className="">Service Charge Table</CardTitle>
							<CardDescription>
								From {tableFilters.ending} | To {tableFilters.starting}
							</CardDescription>
							<CardAction className="flex gap-4">
								<Button
									onClick={() => setIsFilterDialogOpen(true)}
									variant={"outline"}
								>
									Filters
								</Button>
								<Button
									onClick={() => fetchFlatServiceCharges()}
									variant={"outline"}
								>
									Refresh
								</Button>
							</CardAction>
						</CardHeader>
						<CardContent className="">
							<Table ref={tableRef}>
								<TableCaption>
									{serviceCharges.length > 0
										? `${serviceCharges.length} Service Charges(s)`
										: "No Data"}
								</TableCaption>
								<TableHeader>
									<TableRow className="bg-muted">
										<TableHead>Service Charge ID</TableHead>
										<TableHead>Flat Number</TableHead>
										<TableHead>Month</TableHead>
										<TableHead>Year</TableHead>
										<TableHead className="text-right">Amount</TableHead>
										{/* <TableHead className="text-center">Action</TableHead> */}
									</TableRow>
								</TableHeader>
								<TableBody>
									{serviceCharges.map((serviceCharge: any, index) => (
										<TableRow key={index}>
											<TableCell>{serviceCharge._id}</TableCell>
											<TableCell>{serviceCharge.flat.flatNumber}</TableCell>
											<TableCell>{MONTHS[serviceCharge.month - 1]}</TableCell>
											<TableCell>{serviceCharge.year}</TableCell>
											<TableCell className="text-right">
												{serviceCharge.amount.toLocaleString("en-IN")}
											</TableCell>
											{/* <TableCell className="flex flex-row justify-center gap-4 font-semibold">
												<button className="hover:underline cursor-pointer">
													Print
												</button>
											</TableCell> */}
										</TableRow>
									))}
								</TableBody>
							</Table>
							<Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
								<DialogContent>
									<DialogHeader>
										<DialogTitle className="">Set filters</DialogTitle>
									</DialogHeader>
									<div className="flex flex-col gap-6">
										<div className="flex flex-col gap-2">
											<Label htmlFor="from">From</Label>
											<Input
												type="month"
												value={tableFilters.ending}
												onChange={(
													event: React.ChangeEvent<HTMLInputElement>
												) =>
													setTableFilters((prev) => ({
														...prev,
														ending: event.target.value,
													}))
												}
											/>
										</div>
										<div className="flex flex-col gap-2">
											<Label htmlFor="to">To</Label>
											<Input
												type="month"
												value={tableFilters.starting}
												onChange={(
													event: React.ChangeEvent<HTMLInputElement>
												) =>
													setTableFilters((prev) => ({
														...prev,
														starting: event.target.value,
													}))
												}
											/>
										</div>
									</div>
									<DialogFooter className="flex gap-4">
										<DialogClose asChild>
											<Button
												variant={"outline"}
												onClick={() => setIsFilterDialogOpen(false)}
											>
												Cancel
											</Button>
										</DialogClose>
										<Button
											onClick={() => {
												fetchFlatServiceCharges();
												setIsFilterDialogOpen(false);
											}}
										>
											Filter
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</CardContent>
						<CardFooter>
							<Button
								disabled={!serviceCharges || serviceCharges.length === 0}
								onClick={handleDownloadPDF}
							>
								Download PDF
							</Button>
						</CardFooter>
					</Card>
				</CardContent>
			</Card>
			<Footer />
		</main>
	);
};

export default ViewServiceChargesPage;
