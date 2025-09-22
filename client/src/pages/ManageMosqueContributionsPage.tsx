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
import HeaderAdmin from "@/components/HeaderAdmin";
import Footer from "@/components/Footer";
import * as xlsx from "xlsx";
import { fetchBuildingsApi } from "@/api/buildingApi";
import { adminAuthCheckApi } from "@/api/authApi";
import { fetchBuildingFlatsApi } from "@/api/flatApi";
import {
	createContributionApi,
	createMultipleContributionsApi,
	fetchBuildingContributionsApi,
	updateContributionApi,
	deleteContributionApi,
} from "@/api/contributionApi";

const CreateContributionSchema = z.object({
	flatId: z.string("Flat can't be anything other than a string").nonempty("Please select a flat"),
	month: z
		.string("Month can't be anything other than a string")
		.nonempty("Please select a month"),
	year: z
		.number("Year can't be anything other than a number")
		.gte(2020, "You're going too far back in the past"),
	amount: z
		.number("Amount can't be anything other than a number")
		.nonnegative("Amount can't be negative"),
});

const CreateMultipleContributionsSchema = CreateContributionSchema.pick({
	month: true,
	year: true,
});

export type CreateContributionData = z.infer<typeof CreateContributionSchema>;
type CreateMultipleContributionsData = z.infer<typeof CreateMultipleContributionsSchema>;

const ManageMosqueContributionsPage: React.FC = () => {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [buildings, setBuildings] = useState([]);
	const [currentBuildingId, setCurrentBuildingId] = useState<string | null>(null);
	const [flats, setFlats] = useState([]);
	const [contributions, setContributions] = useState([]);
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
	});
	const navigate = useNavigate();

	const fetchBuildingContributions = async () => {
		const response = await fetchBuildingContributionsApi(
			currentBuildingId as string,
			tableFilters.starting,
			tableFilters.ending
		);
		if (response.success) {
			setContributions(response.data);
		} else {
			toast("Failed to fetch building contributions", {
				description:
					response.error || "Some error is preventing contributions from being fetched",
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
			fetchBuildingContributions();
		}
	}, [currentBuildingId]);

	const createContributionForm = useForm<CreateContributionData>({
		resolver: zodResolver(CreateContributionSchema),
		mode: "onSubmit",
		defaultValues: {
			flatId: "",
			month: `${currentDate.getMonth() + 1}`,
			year: currentDate.getFullYear(),
		},
	});

	const createMultipleContributionsForm = useForm<CreateMultipleContributionsData>({
		resolver: zodResolver(CreateMultipleContributionsSchema),
		defaultValues: {
			month: `${currentDate.getMonth() + 1}`,
			year: currentDate.getFullYear(),
		},
	});

	const editContributionForm = useForm<CreateContributionData>({
		resolver: zodResolver(CreateContributionSchema),
		mode: "onSubmit",
		defaultValues: {
			flatId: "",
			month: "",
		},
	});

	const handleCreateContribution = async (formData: CreateContributionData) => {
		setIsFormLoading(true);
		const response = await createContributionApi(formData);
		if (response.success) {
			fetchBuildingContributions();
			toast("Contribution has been created", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			createContributionForm.reset();
		} else {
			createContributionForm.setError("root", {
				message: response.error || "Failed to create contribution",
			});
		}
		setIsFormLoading(false);
	};

	const handleCreateMultipleContributions = async (formData: CreateMultipleContributionsData) => {
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
			if (!entry.flatId || !entry.flatNumber || !entry.amount) {
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
				amount: entry.amount || 0,
			};
		});

		const response = await createMultipleContributionsApi({ data: data });
		if (response.success) {
			fetchBuildingContributions();
			toast(response.data.message, {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			createMultipleContributionsForm.reset();
			setFile(null);
		} else {
			createMultipleContributionsForm.setError("root", {
				message: response.error || "Failed to upload data",
			});
		}
		setIsFormLoading(false);
	};

	const handleEditContribution = async (id: string, formData: CreateContributionData) => {
		setIsFormLoading(true);
		const response = await updateContributionApi(id, formData);
		if (response.success) {
			fetchBuildingContributions();
			toast("Contribution has been edited", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			setIsEditDialogOpen(false);
			editContributionForm.reset();
		} else {
			editContributionForm.setError("root", {
				message: response.error || "Failed to edit contribution",
			});
		}
		setIsFormLoading(false);
	};

	const handleDeleteContribution = async (id: string) => {
		const response = await deleteContributionApi(id);
		if (response.success) {
			fetchBuildingContributions();
			toast("Contribution has been deleted", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			setIsDeleteDialogOpen(false);
		} else {
			toast("Failed to delete contribution", {
				description:
					response.error || "Some error is preventing contribution from being deleted",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
		}
	};

	const handleDownloadSpreadsheet = () => {
		if (!contributions || contributions.length === 0) {
			toast("Can't let you download a spreadsheet", {
				description: "There aren't any data to make a spreadsheet out of",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			return;
		}

		const data = contributions.map((item: any) => ({
			"Mosque Contribution ID": item._id,
			"Flat Number": item.flat.flatNumber,
			Month: MONTHS[item.month - 1],
			Year: item.year,
			Amount: item.amount,
		}));

		const worksheet = xlsx.utils.json_to_sheet(data);
		const workbook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(workbook, worksheet, "Gas usage records");
		xlsx.writeFile(
			workbook,
			`service_charges_f-${tableFilters.starting}_t-${tableFilters.ending}.xlsx`
		);
	};

	return (
		<>
			<main className="flex flex-col min-h-screen gap-6">
				<HeaderAdmin />
				<Card className="flex grow container mx-auto">
					<CardHeader>
						<CardTitle className="text-2xl">Manage Mosque Contributions</CardTitle>
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
									onSubmit={createContributionForm.handleSubmit(
										handleCreateContribution
									)}
									action=""
									method=""
								>
									<div className="flex flex-col gap-2">
										<Label htmlFor="flatId">Flat</Label>
										<Select
											value={createContributionForm.watch("flatId")}
											onValueChange={(value) =>
												createContributionForm.setValue("flatId", value)
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
										{createContributionForm.formState.errors.flatId && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createContributionForm.formState.errors.flatId
														.message
												}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="month">Month</Label>
										<Select
											value={createContributionForm.watch("month")}
											onValueChange={(value) =>
												createContributionForm.setValue("month", value)
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
										{createContributionForm.formState.errors.month && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createContributionForm.formState.errors.month
														.message
												}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="year">Year</Label>
										<Input
											type="number"
											{...createContributionForm.register("year", {
												valueAsNumber: true,
											})}
										/>
										{createContributionForm.formState.errors.year && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createContributionForm.formState.errors.year
														.message
												}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="amount">Amount</Label>
										<Input
											type="number"
											{...createContributionForm.register("amount", {
												valueAsNumber: true,
											})}
										/>
										{createContributionForm.formState.errors.amount && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createContributionForm.formState.errors.amount
														.message
												}
											</span>
										)}
									</div>
									<Button type="submit" disabled={isFormLoading}>
										{isFormLoading ? "Loading..." : "Create"}
									</Button>
									{createContributionForm.formState.errors.root && (
										<span className="text-red-500 text-center">
											{createContributionForm.formState.errors.root.message}
										</span>
									)}
								</form>
							</TabsContent>
							<TabsContent value="multiple">
								<form
									className="flex flex-col gap-6"
									onSubmit={createMultipleContributionsForm.handleSubmit(
										handleCreateMultipleContributions
									)}
									action=""
									method=""
								>
									<div className="flex flex-col gap-2">
										<Label htmlFor="month">Month</Label>
										<Select
											value={createMultipleContributionsForm.watch("month")}
											onValueChange={(value) =>
												createMultipleContributionsForm.setValue(
													"month",
													value
												)
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
										{createMultipleContributionsForm.formState.errors.month && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createMultipleContributionsForm.formState.errors
														.month.message
												}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="year">Year</Label>
										<Input
											type="number"
											{...createContributionForm.register("year", {
												valueAsNumber: true,
											})}
										/>
										{createContributionForm.formState.errors.year && (
											<span className="text-xs text-red-500 font-semibold">
												{
													createContributionForm.formState.errors.year
														.message
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
									{createMultipleContributionsForm.formState.errors.root && (
										<span className="text-red-500 text-center">
											{
												createMultipleContributionsForm.formState.errors
													.root.message
											}
										</span>
									)}
								</form>
							</TabsContent>
						</Tabs>
						<Card className="">
							<CardHeader>
								<CardTitle className="">Mosque Contribution Table</CardTitle>
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
										onClick={() => fetchBuildingContributions()}
										variant={"outline"}
									>
										Refresh
									</Button>
								</CardAction>
							</CardHeader>
							<CardContent>
								<Table>
									<TableCaption>
										{contributions.length > 0
											? `${contributions.length} Mosque Contribution(s)`
											: "No Data"}
									</TableCaption>
									<TableHeader>
										<TableRow className="bg-muted">
											<TableHead>Mosque Contribution ID</TableHead>
											<TableHead>Flat Number</TableHead>
											<TableHead>Month</TableHead>
											<TableHead>Year</TableHead>
											<TableHead className="text-right">Amount</TableHead>
											<TableHead className="text-center">Action</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{contributions.map((contribution: any, index) => (
											<TableRow key={index}>
												<TableCell>{contribution._id}</TableCell>
												<TableCell>
													{contribution.flat.flatNumber}
												</TableCell>
												<TableCell>
													{MONTHS[contribution.month - 1]}
												</TableCell>
												<TableCell>{contribution.year}</TableCell>
												<TableCell className="text-right">
													{contribution.amount.toLocaleString("en-IN")}
												</TableCell>
												<TableCell className="flex flex-row justify-center gap-4 font-semibold">
													<button
														onClick={() => {
															setEditingId(contribution._id);
															editContributionForm.reset({
																flatId: contribution.flat._id,
																month: `${contribution.month}`,
																year: contribution.year,
																amount: contribution.amount,
															});
															setIsEditDialogOpen(true);
														}}
														className="hover:underline cursor-pointer"
													>
														Edit
													</button>
													<button
														onClick={() => {
															setDeletingId(contribution._id);
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
											<DialogTitle className="">
												Edit Mosque Contribution
											</DialogTitle>
											<DialogDescription>
												Please make sure all information is correct before
												proceeding
											</DialogDescription>
										</DialogHeader>
										<form
											className="flex flex-col gap-6 mt-2"
											onSubmit={editContributionForm.handleSubmit(
												(formData) => {
													handleEditContribution(
														editingId as string,
														formData
													);
												}
											)}
											action=""
											method=""
										>
											<div className="flex flex-col gap-2">
												<Label htmlFor="flat">Flat</Label>
												<Select
													value={editContributionForm.watch("flatId")}
													onValueChange={(value) =>
														editContributionForm.setValue(
															"flatId",
															value
														)
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
												{editContributionForm.formState.errors.flatId && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editContributionForm.formState.errors
																.flatId.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="month">Month</Label>
												<Select
													value={editContributionForm.watch("month")}
													onValueChange={(value) =>
														editContributionForm.setValue(
															"month",
															value
														)
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
												{editContributionForm.formState.errors.month && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editContributionForm.formState.errors
																.month.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="year">Year</Label>
												<Input
													type="number"
													{...editContributionForm.register("year", {
														valueAsNumber: true,
													})}
												/>
												{editContributionForm.formState.errors.year && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editContributionForm.formState.errors
																.year.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="amount">Amount</Label>
												<Input
													type="number"
													{...editContributionForm.register("amount", {
														valueAsNumber: true,
													})}
												/>
												{editContributionForm.formState.errors.amount && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editContributionForm.formState.errors
																.amount.message
														}
													</span>
												)}
											</div>
											<Button type="submit" disabled={isFormLoading}>
												{isFormLoading ? "Loading..." : "Save Changes"}
											</Button>
										</form>
										{editContributionForm.formState.errors.root && (
											<DialogFooter>
												<span className="text-red-500 text-center w-full">
													{
														editContributionForm.formState.errors.root
															.message
													}
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
											<DialogTitle className="">
												Delete mosque contribution?
											</DialogTitle>
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
													handleDeleteContribution(deletingId as string)
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
													fetchBuildingContributions();
													setIsFilterDialogOpen(false);
												}}
											>
												Filter
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</CardContent>
						</Card>
					</CardContent>
					<CardFooter>
						<Button
							disabled={!contributions || contributions.length === 0}
							onClick={handleDownloadSpreadsheet}
						>
							Download Spreadsheet
						</Button>
					</CardFooter>
				</Card>
				<Footer />
			</main>
		</>
	);
};

export default ManageMosqueContributionsPage;
