import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectLabel,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	// DialogTrigger,
} from "@/components/ui/dialog";
import { MONTHS, ALLOWED_TYPES } from "@/lib/constants";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as xlsx from "xlsx";
import HeaderAdmin from "@/components/HeaderAdmin";
import Footer from "@/components/Footer";
import { adminAuthCheckApi } from "@/api/authApi";
import { fetchBuildingsApi } from "@/api/buildingApi";
import { fetchBuildingFlatsApi } from "@/api/flatApi";
import {
	createGasUsageApi,
	createMultipleGasUsagesApi,
	fetchBuildingGasUsagesApi,
	updateGasUsageApi,
	// updateMultipleGasUsagesApi,
	deleteGasUsageApi,
} from "@/api/gasUsageApi";

const CreateGasUsageSchema = z.object({
	flatId: z.string("Flat can't be anything other than a string").nonempty("Please select a flat"),
	month: z
		.string("Month can't be anything other than a string")
		.nonempty("Please select a month"),
	year: z
		.number("Year can't be anything other than a number")
		.gte(2020, "You're going too far back in the past"),
	unitReadout: z
		.number("Unit readout can't be anything other than a number")
		.nonnegative("Unit readout can't be negative"),
	unitCost: z
		.number("Unit cost can't be anything other than a number")
		.nonnegative("Unit cost can't be negative"),
});

const CreateMultipleGasUsagesSchema = CreateGasUsageSchema.pick({
	month: true,
	year: true,
	unitCost: true,
});

const EditGasUsageForm = CreateGasUsageSchema.extend({
	billPaid: z
		.number("Bill paid can't be anything other than a number")
		.nonnegative("Bill paid can't be negative"),
});

export type CreateGasUsageData = z.infer<typeof CreateGasUsageSchema>;
type CreateMultipleGasUsagesData = z.infer<typeof CreateMultipleGasUsagesSchema>;
type EditGasUsageData = z.infer<typeof EditGasUsageForm>;

const ManageGasUsagesPage: React.FC = () => {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [buildings, setBuildings] = useState([]);
	const [currentBuildingId, setCurrentBuildingId] = useState<string | null>(null);
	const [flats, setFlats] = useState([]);
	const [gasUsages, setGasUsages] = useState([]);
	const [file, setFile] = useState<File | null>(null);
	const [fileInputError, setFileInputError] = useState<string | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const currentDate = new Date();
	const [tableFilters, setTableFilters] = useState({
		starting: currentDate.toISOString().slice(0, 7),
		ending: currentDate.toISOString().slice(0, 7),
		status: "all",
	});
	const navigate = useNavigate();

	const fetchBuildingGasUsages = async () => {
		const response = await fetchBuildingGasUsagesApi(
			currentBuildingId as string,
			tableFilters.starting,
			tableFilters.ending,
			tableFilters.status
		);
		if (response.success) {
			setGasUsages(response.data);
		} else {
			toast("Failed to fetch building gas usage records", {
				description:
					response.error || "Some error is preventing records from being fetched",
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
		const fetchBuildingFlats = async () => {
			const response = await fetchBuildingFlatsApi(currentBuildingId as string);
			if (response.success) {
				setFlats(response.data);
			} else {
				toast("Failed to fetch flats", {
					description:
						response.error || "Some error is preventing flats from being fetched",
					action: {
						label: "OK",
						onClick: () => {},
					},
				});
			}
		};

		if (currentBuildingId) {
			fetchBuildingFlats();
			fetchBuildingGasUsages();
		}
	}, [currentBuildingId]);

	const createGasUsageForm = useForm<CreateGasUsageData>({
		resolver: zodResolver(CreateGasUsageSchema),
		mode: "onSubmit",
		defaultValues: {
			flatId: "",
			month: `${currentDate.getMonth() + 1}`,
			year: currentDate.getFullYear(),
		},
	});

	const createMultipleGasUsagesForm = useForm<CreateMultipleGasUsagesData>({
		resolver: zodResolver(CreateMultipleGasUsagesSchema),
		defaultValues: {
			month: `${currentDate.getMonth() + 1}`,
			year: currentDate.getFullYear(),
		},
	});

	const editGasUsageForm = useForm<EditGasUsageData>({
		resolver: zodResolver(EditGasUsageForm),
		defaultValues: {
			flatId: "",
			month: "",
		},
	});

	const handleCreateGasUsage = async (formData: CreateGasUsageData) => {
		setIsFormLoading(true);
		const response = await createGasUsageApi(formData);
		if (response.success) {
			fetchBuildingGasUsages();
			toast("Record has been created", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			createGasUsageForm.reset();
		} else {
			createGasUsageForm.setError("root", {
				message: response.error || "Failed to create gas usage record",
			});
		}
		setIsFormLoading(false);
	};

	const handleCreateMultipleGasUsages = async (formData: CreateMultipleGasUsagesData) => {
		setIsFormLoading(true);
		setFileInputError(null);

		if (!file) {
			setFileInputError("File is required");
			setIsFormLoading(false);
			return;
		}
		if (!ALLOWED_TYPES.includes(file.type)) {
			setFileInputError("Only .xls and .xlsx files are allowed");
			setIsFormLoading(false);
			return;
		}
		if (file.size >= 10 * 1024 * 1024) {
			setFileInputError("File size mustn't exceed 10 MB");
			setIsFormLoading(false);
			return;
		}

		const fileData = await file.arrayBuffer();
		const workbook = xlsx.read(fileData, { type: "array" });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const sheetData = xlsx.utils.sheet_to_json(worksheet);

		const data = sheetData.map((entry: any, index) => {
			if (!entry.flatId || !entry.flatNumber || !entry.unitReadout) {
				setFileInputError(`Row ${index + 1} has missing data`);
				setIsFormLoading(false);
				return;
			}
			if (
				!flats.some(
					(flat: any) => flat._id === entry.flatId && flat.flatNumber === entry.flatNumber
				)
			) {
				setFileInputError(`Row ${index + 1} has incorrect data`);
				setIsFormLoading(false);
				return;
			}

			return {
				flatId: entry.flatId,
				month: formData.month,
				year: formData.year,
				unitCost: formData.unitCost,
				unitReadout: entry.unitReadout || 0,
			};
		});

		const response = await createMultipleGasUsagesApi({ data: data });
		if (response.success) {
			fetchBuildingGasUsages();
			toast(response.data.message, {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			createMultipleGasUsagesForm.reset();
			setFile(null);
		} else {
			createMultipleGasUsagesForm.setError("root", {
				message: response.error || "Failed to upload data",
			});
		}
		setIsFormLoading(false);
	};

	const handleEditGasUsage = async (id: string, formData: EditGasUsageData) => {
		setIsFormLoading(true);
		const response = await updateGasUsageApi(id, formData);
		if (response.success) {
			fetchBuildingGasUsages();
			toast("Record has been edited", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			setIsEditDialogOpen(false);
			editGasUsageForm.reset();
		} else {
			editGasUsageForm.setError("root", {
				message: response.error || "Failed to edit record",
			});
		}
		setIsFormLoading(false);
	};

	const handleDeleteGasUsage = async (id: string) => {
		const response = await deleteGasUsageApi(id);
		if (response.success) {
			fetchBuildingGasUsages();
			toast("Record has been deleted", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			setIsDeleteDialogOpen(false);
		} else {
			toast("Failed to delete record", {
				description: response.error || "Some error is preventing record from being deleted",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
		}
	};

	const handleDownloadSpreadsheet = () => {
		if (!gasUsages || gasUsages.length === 0) {
			toast("Can't let you download a spreadsheet", {
				description: "There aren't any data to make a spreadsheet out of",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			return;
		}

		const data = gasUsages.map((gasUsage: any) => ({
			"Gas Usage Record ID": gasUsage._id,
			"Flat Number": gasUsage.flat.flatNumber,
			Month: MONTHS[gasUsage.month - 1],
			Year: gasUsage.year,
			"Unit Readout": gasUsage.unitReadout,
			"Units Used": gasUsage.unitsUsed,
			Bill: gasUsage.billTotal,
			"Paid Bill": gasUsage.billPaid,
			"Remaining Bill": gasUsage.billTotal - gasUsage.billPaid,
			Status: gasUsage.status ? "Paid" : "Unpaid",
		}));

		const worksheet = xlsx.utils.json_to_sheet(data);
		const workbook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(workbook, worksheet, "Gas usage records");
		xlsx.writeFile(
			workbook,
			`gas_usage_records_f-${tableFilters.starting}_t-${tableFilters.ending}_s-${tableFilters.status}.xlsx`
		);
	};

	return (
		<>
			<main className="flex flex-col min-h-screen gap-6">
				<HeaderAdmin />
				<Card className="flex grow container mx-auto">
					<CardHeader>
						<CardTitle className="text-2xl">Manage Gas Usage Records</CardTitle>
						<CardDescription>
							Please make sure all information is correct before proceeding
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-6">
						<div className="flex flex-col gap-2 max-w-md">
							<Label htmlFor="building">Building</Label>
							<Select
								value={currentBuildingId as string}
								onValueChange={(value) => setCurrentBuildingId(value)}
								defaultValue=""
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select building" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Buildings</SelectLabel>
										{buildings.length > 0 &&
											buildings.map((building: any, index) => (
												<SelectItem key={index} value={building._id}>
													{building.buildingNumber}
												</SelectItem>
											))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						<Tabs defaultValue="multiple" className="max-w-md">
							<TabsList className="w-full mb-4">
								<TabsTrigger value="multiple">Create Multiple</TabsTrigger>
								<TabsTrigger value="individual">Create Individually</TabsTrigger>
							</TabsList>
							<TabsContent value="individual">
								<form
									className="flex flex-col gap-6"
									onSubmit={createGasUsageForm.handleSubmit(handleCreateGasUsage)}
									action=""
									method=""
								>
									<div className="flex flex-col gap-2">
										<Label htmlFor="flatId">Flat</Label>
										<Select
											value={createGasUsageForm.watch("flatId")}
											onValueChange={(value) =>
												createGasUsageForm.setValue("flatId", value)
											}
											defaultValue=""
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select flat" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Flats</SelectLabel>
													{flats.map((flat: any, index) => (
														<SelectItem key={index} value={flat._id}>
															{flat.flatNumber}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
										{createGasUsageForm.formState.errors.flatId && (
											<span className="text-xs text-red-500 font-semibold">
												{createGasUsageForm.formState.errors.flatId.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="month">Month</Label>
										<Select
											value={createGasUsageForm.watch("month")}
											onValueChange={(value) =>
												createGasUsageForm.setValue("month", value)
											}
											defaultValue=""
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select month" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Months</SelectLabel>
													{MONTHS.map((month, index) => (
														<SelectItem
															key={index}
															value={`${index + 1}`}
														>
															{month}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
										{createGasUsageForm.formState.errors.month && (
											<span className="text-xs text-red-500 font-semibold">
												{createGasUsageForm.formState.errors.month.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="year">Year</Label>
										<Input
											type="number"
											{...createGasUsageForm.register("year", {
												valueAsNumber: true,
											})}
										/>
										{createGasUsageForm.formState.errors.year && (
											<span className="text-xs text-red-500 font-semibold">
												{createGasUsageForm.formState.errors.year.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="unitReadout">Unit Readout</Label>
										<Input
											type="number"
											{...createGasUsageForm.register("unitReadout", {
												valueAsNumber: true,
											})}
										/>
										{createGasUsageForm.formState.errors.unitReadout && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createGasUsageForm.formState.errors.unitReadout
														.message
												}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="unitCost">Unit Cost</Label>
										<Input
											type="number"
											step="0.01"
											{...createGasUsageForm.register("unitCost", {
												valueAsNumber: true,
											})}
										/>
										{createGasUsageForm.formState.errors.unitCost && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createGasUsageForm.formState.errors.unitCost
														.message
												}
											</span>
										)}
									</div>
									<Button type="submit" disabled={isFormLoading}>
										{isFormLoading ? "Loading..." : "Create"}
									</Button>
									{createGasUsageForm.formState.errors.root && (
										<span className="text-red-500 text-center">
											{createGasUsageForm.formState.errors.root.message}
										</span>
									)}
								</form>
							</TabsContent>
							<TabsContent value="multiple">
								<form
									className="flex flex-col gap-6"
									onSubmit={createMultipleGasUsagesForm.handleSubmit(
										handleCreateMultipleGasUsages
									)}
									action=""
									method=""
								>
									<div className="flex flex-col gap-2">
										<Label htmlFor="month">Month</Label>
										<Select
											value={createMultipleGasUsagesForm.watch("month")}
											onValueChange={(value) =>
												createMultipleGasUsagesForm.setValue("month", value)
											}
											defaultValue=""
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select month" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Months</SelectLabel>
													{MONTHS.map((month, index) => (
														<SelectItem
															key={index}
															value={`${index + 1}`}
														>
															{month}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
										{createMultipleGasUsagesForm.formState.errors.month && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createMultipleGasUsagesForm.formState.errors
														.month.message
												}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="year">Year</Label>
										<Input
											type="number"
											{...createMultipleGasUsagesForm.register("year", {
												valueAsNumber: true,
											})}
										/>
										{createMultipleGasUsagesForm.formState.errors.year && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createMultipleGasUsagesForm.formState.errors
														.year.message
												}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="unitCost">Unit Cost</Label>
										<Input
											type="number"
											step="0.01"
											{...createMultipleGasUsagesForm.register("unitCost", {
												valueAsNumber: true,
											})}
										/>
										{createMultipleGasUsagesForm.formState.errors.unitCost && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createMultipleGasUsagesForm.formState.errors
														.unitCost.message
												}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="spreadsheet">Upload Spreadsheet</Label>
										<Input
											type="file"
											accept=".xls, .xlsx"
											onChange={(
												event: React.ChangeEvent<HTMLInputElement>
											) => {
												setFile(
													event.target.files && event.target.files[0]
												);
											}}
										/>
										{fileInputError && (
											<span className="text-xs text-red-500 font-semibold">
												{fileInputError}
											</span>
										)}
									</div>
									<Button type="submit" disabled={isFormLoading}>
										{isFormLoading ? "Loading..." : "Create"}
									</Button>
									{createMultipleGasUsagesForm.formState.errors.root && (
										<span className="text-red-500 text-center">
											{
												createMultipleGasUsagesForm.formState.errors.root
													.message
											}
										</span>
									)}
								</form>
							</TabsContent>
						</Tabs>
						<Card className="">
							<CardHeader>
								<CardTitle className="">Gas Usage Record Table</CardTitle>
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
										onClick={() => fetchBuildingGasUsages()}
										variant={"outline"}
									>
										Refresh
									</Button>
								</CardAction>
							</CardHeader>
							<CardContent className="">
								<Table>
									<TableCaption>
										{gasUsages.length > 0
											? `${gasUsages.length} Gas Usage Record(s)`
											: "No Data"}
									</TableCaption>
									<TableHeader>
										<TableRow className="bg-muted">
											<TableHead>Gas Usage Record ID</TableHead>
											<TableHead>Flat Number</TableHead>
											<TableHead>Month</TableHead>
											<TableHead>Year</TableHead>
											<TableHead className="text-right">
												Unit Readout
											</TableHead>
											<TableHead className="text-right">Unit Cost</TableHead>
											<TableHead className="text-right">Units Used</TableHead>
											<TableHead className="text-right">Total Bill</TableHead>
											<TableHead className="text-right">Paid Bill</TableHead>
											<TableHead className="text-right">
												Remaining Bill
											</TableHead>
											<TableHead className="text-center">Status</TableHead>
											<TableHead className="text-center">Action</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{gasUsages.map((gasUsage: any, index) => (
											<TableRow key={index}>
												<TableCell>{gasUsage._id}</TableCell>
												<TableCell>{gasUsage.flat.flatNumber}</TableCell>
												<TableCell>{MONTHS[gasUsage.month - 1]}</TableCell>
												<TableCell>{gasUsage.year}</TableCell>
												<TableCell className="text-right">
													{gasUsage.unitReadout.toLocaleString("en-IN")}
												</TableCell>
												<TableCell className="text-right">
													{gasUsage.unitCost.toLocaleString("en-IN")}
												</TableCell>
												<TableCell className="text-right">
													{gasUsage.unitsUsed.toLocaleString("en-IN")}
												</TableCell>
												<TableCell className="text-right">
													{gasUsage.billTotal.toLocaleString("en-IN")}
												</TableCell>
												<TableCell className="text-right">
													{gasUsage.billPaid.toLocaleString("en-IN")}
												</TableCell>
												<TableCell className="text-right">
													{(
														gasUsage.billTotal - gasUsage.billPaid
													).toLocaleString("en-IN")}
												</TableCell>
												<TableCell className="text-center">
													{gasUsage.status ? (
														<Badge
															className="bg-green-500 rounded-xs"
															variant={"default"}
														>
															Paid
														</Badge>
													) : (
														<Badge
															className="bg-red-500 rounded-xs"
															variant={"default"}
														>
															Unpaid
														</Badge>
													)}
												</TableCell>
												<TableCell className="flex flex-row justify-center gap-4 font-semibold">
													<button
														onClick={() => {
															setEditingId(gasUsage._id);
															editGasUsageForm.reset({
																flatId: gasUsage.flat._id,
																month: `${gasUsage.month}`,
																year: gasUsage.year,
																unitReadout: gasUsage.unitReadout,
																unitCost: gasUsage.unitCost,
																billPaid: gasUsage.billPaid,
															});
															setIsEditDialogOpen(true);
														}}
														className="hover:underline cursor-pointer"
													>
														Edit
													</button>
													<button
														onClick={() => {
															setDeletingId(gasUsage._id);
															setIsDeleteDialogOpen(true);
														}}
														className="hover:underline cursor-pointer"
													>
														Delete
													</button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
								<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
									<DialogContent className="">
										<DialogHeader>
											<DialogTitle className="">Edit Record</DialogTitle>
											<DialogDescription>
												Please make sure all information is correct before
												proceeding
											</DialogDescription>
										</DialogHeader>
										<form
											className="flex flex-col gap-6"
											onSubmit={editGasUsageForm.handleSubmit((formData) => {
												handleEditGasUsage(editingId as string, formData);
											})}
											action=""
											method=""
										>
											<div className="flex flex-col gap-2">
												<Label htmlFor="flatId">Flat</Label>
												<Select
													value={editGasUsageForm.watch("flatId")}
													onValueChange={(value) =>
														editGasUsageForm.setValue("flatId", value)
													}
													defaultValue=""
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select flat" />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>Flats</SelectLabel>
															{flats.map((flat: any, index) => (
																<SelectItem
																	key={index}
																	value={flat._id}
																>
																	{flat.flatNumber}
																</SelectItem>
															))}
														</SelectGroup>
													</SelectContent>
												</Select>
												{editGasUsageForm.formState.errors.flatId && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editGasUsageForm.formState.errors.flatId
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="month">Month</Label>
												<Select
													value={editGasUsageForm.watch("month")}
													onValueChange={(value) =>
														editGasUsageForm.setValue("month", value)
													}
													defaultValue=""
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select month" />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>Months</SelectLabel>
															{MONTHS.map((month, index) => (
																<SelectItem
																	key={index}
																	value={`${index + 1}`}
																>
																	{month}
																</SelectItem>
															))}
														</SelectGroup>
													</SelectContent>
												</Select>
												{editGasUsageForm.formState.errors.month && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editGasUsageForm.formState.errors.month
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="year">Year</Label>
												<Input
													type="number"
													{...editGasUsageForm.register("year", {
														valueAsNumber: true,
													})}
												/>
												{editGasUsageForm.formState.errors.year && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editGasUsageForm.formState.errors.year
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="unitReadout">Unit Readout</Label>
												<Input
													type="number"
													{...editGasUsageForm.register("unitReadout", {
														valueAsNumber: true,
													})}
												/>
												{editGasUsageForm.formState.errors.unitReadout && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editGasUsageForm.formState.errors
																.unitReadout.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="unitCost">Unit Cost</Label>
												<Input
													type="number"
													step="0.01"
													{...editGasUsageForm.register("unitCost", {
														valueAsNumber: true,
													})}
												/>
												{editGasUsageForm.formState.errors.unitCost && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editGasUsageForm.formState.errors
																.unitCost.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="billPaid">Bill Paid</Label>
												<Input
													type="number"
													step="0.01"
													{...editGasUsageForm.register("billPaid", {
														valueAsNumber: true,
													})}
												/>
												{editGasUsageForm.formState.errors.billPaid && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editGasUsageForm.formState.errors
																.billPaid.message
														}
													</span>
												)}
											</div>
											<Button type="submit" disabled={isFormLoading}>
												{isFormLoading ? "Loading..." : "Create"}
											</Button>
										</form>
										{editGasUsageForm.formState.errors.root && (
											<DialogFooter>
												<span className="text-red-500 text-center">
													{editGasUsageForm.formState.errors.root.message}
												</span>
											</DialogFooter>
										)}
									</DialogContent>
								</Dialog>
								<Dialog
									open={isDeleteDialogOpen}
									onOpenChange={setIsDeleteDialogOpen}
								>
									<DialogContent>
										<DialogHeader>
											<DialogTitle className="">Delete record?</DialogTitle>
											<DialogDescription>
												Once you delete, this action can't be undone
											</DialogDescription>
										</DialogHeader>
										<DialogFooter className="flex gap-4">
											<DialogClose asChild>
												<Button
													variant={"outline"}
													onClick={() => setIsDeleteDialogOpen(false)}
												>
													Cancel
												</Button>
											</DialogClose>
											<Button
												onClick={() =>
													handleDeleteGasUsage(deletingId as string)
												}
											>
												Delete
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
								<Dialog
									open={isFilterDialogOpen}
									onOpenChange={setIsFilterDialogOpen}
								>
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
											<div className="flex flex-col gap-2">
												<Label htmlFor="status">Status</Label>
												<Select
													value={tableFilters.status}
													onValueChange={(value) =>
														setTableFilters((prev) => ({
															...prev,
															status: value,
														}))
													}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select month" />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>Status</SelectLabel>
															<SelectItem value="all">All</SelectItem>
															<SelectItem value="true">
																Paid
															</SelectItem>
															<SelectItem value="false">
																Unpaid
															</SelectItem>
														</SelectGroup>
													</SelectContent>
												</Select>
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
													fetchBuildingGasUsages();
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
									disabled={!gasUsages || gasUsages.length === 0}
									onClick={handleDownloadSpreadsheet}
								>
									Download Spreadsheet
								</Button>
							</CardFooter>
						</Card>
					</CardContent>
				</Card>
				<Footer />
			</main>
		</>
	);
};

export default ManageGasUsagesPage;
