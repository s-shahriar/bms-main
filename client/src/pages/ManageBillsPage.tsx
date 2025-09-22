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
import { fetchBuildingFlatsApi } from "@/api/flatApi";
import {
	fetchBillsApi,
	createBillApi,
	uploadBillsApi,
	updateBillApi,
	deleteBillApi,
} from "@/api/billApi";

const CreateBillSchema = z.object({
	flatId: z.string("Flat can't be anything other than a string").nonempty("Please select a flat"),
	month: z
		.string("Month can't be anything other than a string")
		.nonempty("Please select a month"),
	year: z
		.number("Year can't be anything other than a number")
		.gte(2020, "You're going too far back in the past"),
	billAmount: z
		.number("Bill amount can't be anything other than a number")
		.gte(1, "Bill amount can't be less than or equal to zero"),
	paidAmount: z
		.number("Paid amount can't be anything other than a number")
		.nonnegative("Paid amount can't be negative"),
});

const UploadBillSchema = CreateBillSchema.pick({ month: true, year: true });

export type CreateBillData = z.infer<typeof CreateBillSchema>;
type UploadBillData = z.infer<typeof UploadBillSchema>;

const ManageBillsPage: React.FC = () => {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [flats, setFlats] = useState([]);
	const [bills, setBills] = useState([]);
	const [file, setFile] = useState<File | null>(null);
	const [fileInputError, setFileInputError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const navigate = useNavigate();

	const fetchBills = async () => {
		const response = await fetchBillsApi(currentPage, 10, false);
		if (response.success) {
			setBills(response.data.bills);
			setTotalPages(response.data.totalPages);
		} else {
			toast("Failed to fetch bills", {
				description: response.error || "Some error is preventing bills from being fetched",
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

		const fetchFlats = async () => {
			const response = await fetchBuildingFlatsApi("687648153d80b004736bb1d9");
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

		adminAuthCheck();
		fetchFlats();
		fetchBills();
	}, [navigate]);

	const createBillForm = useForm<CreateBillData>({
		resolver: zodResolver(CreateBillSchema),
		mode: "onSubmit",
		defaultValues: {
			flatId: "",
			month: "",
		},
	});

	const uploadBillForm = useForm<UploadBillData>({
		resolver: zodResolver(UploadBillSchema),
		mode: "onSubmit",
		defaultValues: {
			month: "",
		},
	});

	const editBillForm = useForm<CreateBillData>({
		resolver: zodResolver(CreateBillSchema),
		mode: "onSubmit",
		defaultValues: {
			flatId: "",
			month: "",
		},
	});

	const handleCreateBill = async (formData: CreateBillData) => {
		setIsFormLoading(true);
		const response = await createBillApi(formData);
		if (response.success) {
			fetchBills();
			toast("Bill has been created", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			createBillForm.reset();
		} else {
			createBillForm.setError("root", {
				message: response.error || "Failed to create bill",
			});
		}
		setIsFormLoading(false);
	};

	const handleUploadBill = async (formData: UploadBillData) => {
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
			if (!entry.flatId || !entry.flatNumber) {
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
				flat: entry.flatId,
				month: Number(formData.month),
				year: formData.year,
				billAmount: entry.billAmount || 0,
				paidAmount: 0,
			};
		});

		const response = await uploadBillsApi({ data: data });
		if (response.success) {
			fetchBills();
			toast(`${response.data.count} bills have been created`, {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			uploadBillForm.reset();
			setFile(null);
		} else {
			uploadBillForm.setError("root", {
				message: response.error || "Failed to upload bills",
			});
		}
		setIsFormLoading(false);
	};

	const handleEditBill = async (id: string, formData: CreateBillData) => {
		setIsFormLoading(true);
		const response = await updateBillApi(id, formData);
		if (response.success) {
			fetchBills();
			toast("Bill has been edited", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			setIsEditDialogOpen(false);
			editBillForm.reset();
		} else {
			editBillForm.setError("root", {
				message: response.error || "Failed to edit bill",
			});
		}
		setIsFormLoading(false);
	};

	const handleDeleteBill = async (id: string) => {
		const response = await deleteBillApi(id);
		if (response.success) {
			fetchBills();
			toast("Bill has been deleted", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			setIsDeleteDialogOpen(false);
		} else {
			toast("Failed to delete bill", {
				description: response.error || "Some error is preventing bill from being deleted",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
		}
	};

	return (
		<>
			<main className="flex flex-col min-h-screen gap-6">
				<HeaderAdmin />
				<Card className="flex grow container mx-auto">
					<CardHeader>
						<CardTitle className="text-2xl">Create Bill</CardTitle>
						<CardDescription>
							Please make sure all information is correct before proceeding
						</CardDescription>
						<CardAction>Card Action</CardAction>
					</CardHeader>
					<CardContent className="flex flex-col gap-6">
						<Tabs defaultValue="create" className="max-w-md">
							<TabsList className="w-full mb-4">
								<TabsTrigger value="create">Create Individually</TabsTrigger>
								<TabsTrigger value="upload">Upload Collectively</TabsTrigger>
							</TabsList>
							<TabsContent value="create">
								<form
									className="flex flex-col gap-6"
									onSubmit={createBillForm.handleSubmit(handleCreateBill)}
									action=""
									method=""
								>
									<div className="flex flex-col gap-2">
										<Label htmlFor="flatId">Flat</Label>
										<Select
											value={createBillForm.watch("flatId")}
											onValueChange={(value) =>
												createBillForm.setValue("flatId", value)
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
										{createBillForm.formState.errors.flatId && (
											<span className="text-xs text-red-500 font-semibold">
												{createBillForm.formState.errors.flatId.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="month">Month</Label>
										<Select
											value={createBillForm.watch("month")}
											onValueChange={(value) =>
												createBillForm.setValue("month", value)
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
										{createBillForm.formState.errors.month && (
											<span className="text-xs text-red-500 font-semibold">
												{createBillForm.formState.errors.month.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="year">Year</Label>
										<Input
											type="number"
											{...createBillForm.register("year", {
												valueAsNumber: true,
											})}
										/>
										{createBillForm.formState.errors.year && (
											<span className="text-xs text-red-500 font-semibold">
												{createBillForm.formState.errors.year.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="billAmount">Bill Amount</Label>
										<Input
											type="number"
											{...createBillForm.register("billAmount", {
												valueAsNumber: true,
											})}
										/>
										{createBillForm.formState.errors.billAmount && (
											<span className="text-xs text-red-500 font-semibold">
												{createBillForm.formState.errors.billAmount.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="paidAmount">Paid Amount</Label>
										<Input
											type="number"
											{...createBillForm.register("paidAmount", {
												valueAsNumber: true,
											})}
										/>
										{createBillForm.formState.errors.paidAmount && (
											<span className="text-xs text-red-500 font-semibold">
												{createBillForm.formState.errors.paidAmount.message}
											</span>
										)}
									</div>
									<Button type="submit" disabled={isFormLoading}>
										{isFormLoading ? "Loading..." : "Create"}
									</Button>
									{createBillForm.formState.errors.root && (
										<span className="text-red-500 text-center">
											{createBillForm.formState.errors.root.message}
										</span>
									)}
								</form>
							</TabsContent>
							<TabsContent value="upload">
								<form
									className="flex flex-col gap-6"
									onSubmit={uploadBillForm.handleSubmit(handleUploadBill)}
									action=""
									method=""
								>
									<div className="flex flex-col gap-2">
										<Label htmlFor="month">Month</Label>
										<Select
											value={uploadBillForm.watch("month")}
											onValueChange={(value) =>
												uploadBillForm.setValue("month", value)
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
										{uploadBillForm.formState.errors.month && (
											<span className="text-xs text-red-500 font-semibold">
												{uploadBillForm.formState.errors.month.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="year">Year</Label>
										<Input
											type="number"
											{...uploadBillForm.register("year", {
												valueAsNumber: true,
											})}
										/>
										{uploadBillForm.formState.errors.year && (
											<span className="text-xs text-red-500 font-semibold">
												{uploadBillForm.formState.errors.year.message}
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
										{isFormLoading ? "Loading..." : "Upload"}
									</Button>
									{uploadBillForm.formState.errors.root && (
										<span className="text-red-500 text-center">
											{uploadBillForm.formState.errors.root.message}
										</span>
									)}
								</form>
							</TabsContent>
						</Tabs>
						<Card className="">
							<CardHeader>
								<CardTitle className="">Bill Table</CardTitle>
								<CardDescription>Card description</CardDescription>
								<CardAction>
									<Button onClick={fetchBills} variant={"outline"}>
										Refresh
									</Button>
								</CardAction>
							</CardHeader>
							<CardContent>
								<Table>
									<TableCaption>
										{bills.length > 0
											? `Page ${currentPage} out of ${totalPages}`
											: "No data"}
									</TableCaption>
									<TableHeader>
										<TableRow className="bg-muted">
											<TableHead>Bill ID</TableHead>
											<TableHead>Flat Number</TableHead>
											<TableHead>Month</TableHead>
											<TableHead>Year</TableHead>
											<TableHead className="text-right">
												Bill Amount
											</TableHead>
											<TableHead className="text-right">
												Paid Amount
											</TableHead>
											<TableHead className="text-right">
												Remaining Amount
											</TableHead>
											<TableHead className="text-center">Status</TableHead>
											<TableHead className="text-center">Action</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{bills.map((bill: any, index) => (
											<TableRow key={index}>
												<TableCell>{bill._id}</TableCell>
												<TableCell>{bill.flat.flatNumber}</TableCell>
												<TableCell>{MONTHS[bill.month - 1]}</TableCell>
												<TableCell>{bill.year}</TableCell>
												<TableCell className="text-right">
													{bill.billAmount}
												</TableCell>
												<TableCell className="text-right">
													{bill.paidAmount}
												</TableCell>
												<TableCell className="text-right">
													{bill.billAmount - bill.paidAmount}
												</TableCell>
												<TableCell className="text-center">
													{bill.paidAmount < bill.billAmount ? (
														<Badge
															className="bg-red-500 rounded-xs"
															variant={"default"}
														>
															Unpaid
														</Badge>
													) : (
														<Badge
															className="bg-green-500 rounded-xs"
															variant={"default"}
														>
															Paid
														</Badge>
													)}
												</TableCell>
												<TableCell className="flex flex-row justify-center gap-4 font-semibold">
													<button
														onClick={() => {
															setEditingId(bill._id);
															editBillForm.reset({
																flatId: bill.flat._id,
																month: `${bill.month}`,
																year: bill.year,
																billAmount: bill.billAmount,
																paidAmount: bill.paidAmount,
															});
															setIsEditDialogOpen(true);
														}}
														className="hover:underline cursor-pointer"
													>
														Edit
													</button>
													<button
														onClick={() => {
															setDeletingId(bill._id);
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
											<DialogTitle className="">Edit Bill</DialogTitle>
											<DialogDescription>
												Please make sure all information is correct before
												proceeding
											</DialogDescription>
										</DialogHeader>
										<form
											className="flex flex-col gap-6 mt-2"
											onSubmit={editBillForm.handleSubmit((formData) => {
												handleEditBill(editingId as string, formData);
											})}
											action=""
											method=""
										>
											<div className="flex flex-col gap-2">
												<Label htmlFor="flat">Flat</Label>
												<Select
													value={editBillForm.watch("flatId")}
													onValueChange={(value) =>
														editBillForm.setValue("flatId", value)
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
												{editBillForm.formState.errors.flatId && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editBillForm.formState.errors.flatId
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="month">Month</Label>
												<Select
													value={editBillForm.watch("month")}
													onValueChange={(value) =>
														editBillForm.setValue("month", value)
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
												{editBillForm.formState.errors.month && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editBillForm.formState.errors.month
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="year">Year</Label>
												<Input
													type="number"
													{...editBillForm.register("year", {
														valueAsNumber: true,
													})}
												/>
												{editBillForm.formState.errors.year && (
													<span className="text-xs text-red-500 font-semibold">
														{editBillForm.formState.errors.year.message}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="billAmount">Bill Amount</Label>
												<Input
													type="number"
													{...editBillForm.register("billAmount", {
														valueAsNumber: true,
													})}
												/>
												{editBillForm.formState.errors.billAmount && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editBillForm.formState.errors.billAmount
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="paidAmount">Paid Amount</Label>
												<Input
													type="number"
													{...editBillForm.register("paidAmount", {
														valueAsNumber: true,
													})}
												/>
												{editBillForm.formState.errors.paidAmount && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editBillForm.formState.errors.paidAmount
																.message
														}
													</span>
												)}
											</div>
											<Button type="submit" disabled={isFormLoading}>
												{isFormLoading ? "Loading..." : "Save Changes"}
											</Button>
										</form>
										{editBillForm.formState.errors.root && (
											<DialogFooter>
												<span className="text-red-500 text-center w-full">
													{editBillForm.formState.errors.root.message}
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
												Are you sure you want to delete this bill?
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
													handleDeleteBill(deletingId as string)
												}
											>
												Delete
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</CardContent>
							<CardFooter className="flex justify-between">
								<Button
									onClick={() => {
										if (currentPage > 1) {
											setCurrentPage(currentPage - 1);
											fetchBills();
										}
									}}
									disabled={currentPage === 1}
									variant={"outline"}
								>
									Previous
								</Button>
								<Button
									onClick={() => {
										if (currentPage < totalPages) {
											setCurrentPage(currentPage + 1);
											fetchBills();
										}
									}}
									disabled={currentPage === totalPages || totalPages === 0}
									variant={"outline"}
								>
									Next
								</Button>
							</CardFooter>
						</Card>
					</CardContent>
					<CardFooter>
						<p>Card Footer</p>
					</CardFooter>
				</Card>
				<Footer />
			</main>
		</>
	);
};

export default ManageBillsPage;
