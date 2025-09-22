import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	// CardFooter,
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
import { MONTHS } from "@/lib/constants";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import HeaderAdmin from "@/components/HeaderAdmin";
import Footer from "@/components/Footer";
import { adminAuthCheckApi } from "@/api/authApi";
import { fetchBuildingsApi } from "@/api/buildingApi";
import {
	createCylinderULApi,
	fetchBuildingCylinderULsApi,
	updateCylinderULApi,
	deleteCylinderULApi,
} from "@/api/cylinderULApi";

const CreateCylinderULSchema = z.object({
	buildingId: z
		.string("Building can't be anything other than a string")
		.nonempty("Please select a building"),
	month: z
		.string("Month can't be anything other than a string")
		.nonempty("Please select a month"),
	year: z
		.number("Year can't be anything other than a number")
		.gte(2020, "You're going too far back in the past"),
	cylindersUsed: z
		.number("Cylinders purchased can't be anything other than a number")
		.gte(1, "Cylinders purchased can't be less than or equal to zero"),
	unitCost: z
		.number("Cost can't be anything other than a number")
		.gte(1, "Cost can't be less than or equal to zero"),
});

export type CreateCylinderULData = z.infer<typeof CreateCylinderULSchema>;

const ManageCylinderULsPage = () => {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [buildings, setBuildings] = useState([]);
	const [currentBuildingId, setCurrentBuildingId] = useState<string | null>(null);
	const [cylinderLogs, setCylinderLogs] = useState([]);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const currentDate = new Date();
	const [tableFilters, setTableFilters] = useState({
		starting: `${currentDate.getFullYear()}-01`,
		ending: currentDate.toISOString().slice(0, 7),
	});
	const navigate = useNavigate();

	const fetchBuildingCylinderULs = async () => {
		const response = await fetchBuildingCylinderULsApi(
			currentBuildingId as string,
			tableFilters.starting,
			tableFilters.ending
		);
		if (response.success) {
			setCylinderLogs(response.data);
		} else {
			toast("Failed to fetch cylinder logs", {
				description:
					response.error || "Some error is preventing cylinder logs from being fetched",
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
			fetchBuildingCylinderULs();
		}
	}, [currentBuildingId]);

	const createCylinderULForm = useForm<CreateCylinderULData>({
		resolver: zodResolver(CreateCylinderULSchema),
		mode: "onSubmit",
		defaultValues: {
			buildingId: "",
			month: `${currentDate.getMonth() + 1}`,
			year: currentDate.getFullYear(),
		},
	});

	const editCylinderULForm = useForm<CreateCylinderULData>({
		resolver: zodResolver(CreateCylinderULSchema),
		mode: "onSubmit",
		defaultValues: {
			buildingId: "",
			month: "",
		},
	});

	const handleCreateCylinderLog = async (formData: CreateCylinderULData) => {
		setIsFormLoading(true);
		const response = await createCylinderULApi(formData);
		if (response.success) {
			fetchBuildingCylinderULs();
			toast("Cylinder log has been created", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			createCylinderULForm.reset();
		} else {
			createCylinderULForm.setError("root", {
				message: response.error || "Failed to create cylinder log",
			});
		}
		setIsFormLoading(false);
	};

	const handleEditCylinderLog = async (id: string, formData: CreateCylinderULData) => {
		setIsFormLoading(true);
		const response = await updateCylinderULApi(id, formData);
		if (response.success) {
			fetchBuildingCylinderULs();
			toast("Cylinder log has been updated", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			setIsEditDialogOpen(false);
			editCylinderULForm.reset();
		} else {
			editCylinderULForm.setError("root", {
				message: response.error || "Failed to update cylinder log",
			});
		}
		setIsFormLoading(false);
	};

	const handleDeleteCylinderLog = async (id: string) => {
		const response = await deleteCylinderULApi(id);
		if (response.success) {
			fetchBuildingCylinderULs();
			toast("Cylinder log has been deleted", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			setIsDeleteDialogOpen(false);
		} else {
			toast("Failed to delete cylinder log", {
				description:
					response.error || "Some error is preventing cylinder log from being deleted",
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
						<CardTitle className="text-2xl">Manage Cylinder Usage Logs</CardTitle>
						<CardDescription>
							Please make sure all information is correct before creating
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-6">
						<form
							className="flex flex-col gap-6 max-w-md"
							onSubmit={createCylinderULForm.handleSubmit(handleCreateCylinderLog)}
							action=""
							method=""
						>
							<div className="flex flex-col gap-2">
								<Label htmlFor="building">Building</Label>
								<Select
									value={createCylinderULForm.watch("buildingId")}
									onValueChange={(value) =>
										createCylinderULForm.setValue("buildingId", value)
									}
									defaultValue=""
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select building" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Buildings</SelectLabel>
											{buildings.map((building: any, index) => (
												<SelectItem key={index} value={building._id}>
													{building.buildingNumber}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
								{createCylinderULForm.formState.errors.buildingId && (
									<span className="text-xs text-red-500 font-semibold">
										{createCylinderULForm.formState.errors.buildingId.message}
									</span>
								)}
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="month">Month</Label>
								<Select
									value={createCylinderULForm.watch("month")}
									onValueChange={(value) =>
										createCylinderULForm.setValue("month", value)
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
												<SelectItem key={index} value={`${index + 1}`}>
													{month}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
								{createCylinderULForm.formState.errors.month && (
									<span className="text-xs text-red-500 font-semibold">
										{createCylinderULForm.formState.errors.month.message}
									</span>
								)}
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="year">Year</Label>
								<Input
									type="number"
									{...createCylinderULForm.register("year", {
										valueAsNumber: true,
									})}
								/>
								{createCylinderULForm.formState.errors.year && (
									<span className="text-xs text-red-500 font-semibold">
										{createCylinderULForm.formState.errors.year.message}
									</span>
								)}
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="cylindersPurchased">Cylinders Used</Label>
								<Input
									type="number"
									{...createCylinderULForm.register("cylindersUsed", {
										valueAsNumber: true,
									})}
								/>
								{createCylinderULForm.formState.errors.cylindersUsed && (
									<span className="text-xs text-red-500 font-semibold">
										{
											createCylinderULForm.formState.errors.cylindersUsed
												.message
										}
									</span>
								)}
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="cost">Unit Cost</Label>
								<Input
									type="number"
									{...createCylinderULForm.register("unitCost", {
										valueAsNumber: true,
									})}
								/>
								{createCylinderULForm.formState.errors.unitCost && (
									<span className="text-xs text-red-500 font-semibold">
										{createCylinderULForm.formState.errors.unitCost.message}
									</span>
								)}
							</div>
							<Button type="submit" disabled={isFormLoading}>
								{isFormLoading ? "Loading..." : "Create"}
							</Button>
							{createCylinderULForm.formState.errors.root && (
								<span className="text-red-500">
									{createCylinderULForm.formState.errors.root.message}
								</span>
							)}
						</form>
						<Card className="">
							<CardHeader>
								<CardTitle className="">Cylinder Usage Log Table</CardTitle>
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
									<Button onClick={fetchBuildingCylinderULs} variant={"outline"}>
										Refresh
									</Button>
								</CardAction>
							</CardHeader>
							<CardContent>
								<Table>
									<TableCaption>
										{cylinderLogs.length > 0
											? `${cylinderLogs.length} Cylinder Usage Log(s)`
											: "No Data"}
									</TableCaption>
									<TableHeader>
										<TableRow className="bg-muted">
											<TableHead>Cylinder Log ID</TableHead>
											<TableHead>Building Number</TableHead>
											<TableHead>Month</TableHead>
											<TableHead>Year</TableHead>
											<TableHead>Cylinders Used</TableHead>
											<TableHead className="text-right">Unit Cost</TableHead>
											<TableHead className="text-right">Total Cost</TableHead>
											<TableHead className="text-center">Action</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{cylinderLogs.map((cylinderLog: any, index) => (
											<TableRow key={index}>
												<TableCell>{cylinderLog._id}</TableCell>
												<TableCell>
													{cylinderLog.building.buildingNumber}
												</TableCell>
												<TableCell>
													{MONTHS[cylinderLog.month - 1]}
												</TableCell>
												<TableCell>{cylinderLog.year}</TableCell>
												<TableCell>{cylinderLog.cylindersUsed}</TableCell>
												<TableCell className="text-right">
													{cylinderLog.unitCost.toLocaleString("en-IN")}
												</TableCell>
												<TableCell className="text-right">
													{cylinderLog.totalCost.toLocaleString("en-IN")}
												</TableCell>
												<TableCell className="flex flex-row justify-center gap-4 font-semibold">
													<button
														onClick={() => {
															setEditingId(cylinderLog._id);
															editCylinderULForm.reset({
																buildingId:
																	cylinderLog.building._id,
																month: `${cylinderLog.month}`,
																year: cylinderLog.year,
																cylindersUsed:
																	cylinderLog.cylindersPurchased,
																unitCost: cylinderLog.cost,
															});
															setIsEditDialogOpen(true);
														}}
														className="hover:underline cursor-pointer"
													>
														Edit
													</button>
													<button
														onClick={() => {
															setDeletingId(cylinderLog._id);
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
									<DialogContent>
										<DialogHeader>
											<DialogTitle className="">
												Edit Cylinder Purchase Log
											</DialogTitle>
											<DialogDescription>
												Please make sure all information is correct before
												proceeding
											</DialogDescription>
										</DialogHeader>
										<form
											onSubmit={editCylinderULForm.handleSubmit(
												(formData) => {
													handleEditCylinderLog(
														editingId as string,
														formData
													);
												}
											)}
											className="flex flex-col gap-6 mt-2"
											action=""
											method=""
										>
											<div className="flex flex-col gap-2">
												<Label htmlFor="building">Building</Label>
												<Select
													value={editCylinderULForm.watch("buildingId")}
													onValueChange={(value) =>
														editCylinderULForm.setValue(
															"buildingId",
															value
														)
													}
													defaultValue=""
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select building" />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>Buildings</SelectLabel>
															{buildings.map(
																(building: any, index) => (
																	<SelectItem
																		key={index}
																		value={building._id}
																	>
																		{building.buildingNumber}
																	</SelectItem>
																)
															)}
														</SelectGroup>
													</SelectContent>
												</Select>
												{editCylinderULForm.formState.errors.buildingId && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editCylinderULForm.formState.errors
																.buildingId.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="month">Month</Label>
												<Select
													value={editCylinderULForm.watch("month")}
													onValueChange={(value) =>
														editCylinderULForm.setValue("month", value)
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
												{editCylinderULForm.formState.errors.month && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editCylinderULForm.formState.errors
																.month.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="year">Year</Label>
												<Input
													type="number"
													{...createCylinderULForm.register("year", {
														valueAsNumber: true,
													})}
												/>
												{createCylinderULForm.formState.errors.year && (
													<span className="text-xs text-red-500 font-semibold">
														{
															createCylinderULForm.formState.errors
																.year.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="cylindersPurchased">
													Cylinders Purchased
												</Label>
												<Input
													type="number"
													{...editCylinderULForm.register(
														"cylindersUsed",
														{
															valueAsNumber: true,
														}
													)}
												/>
												{editCylinderULForm.formState.errors
													.cylindersUsed && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editCylinderULForm.formState.errors
																.cylindersUsed.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="cost">Cost</Label>
												<Input
													type="number"
													{...editCylinderULForm.register("unitCost", {
														valueAsNumber: true,
													})}
												/>
												{editCylinderULForm.formState.errors.unitCost && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editCylinderULForm.formState.errors
																.unitCost.message
														}
													</span>
												)}
											</div>
											<Button type="submit" disabled={isFormLoading}>
												{isFormLoading ? "Loading..." : "Save Changes"}
											</Button>
										</form>
										{editCylinderULForm.formState.errors.root && (
											<DialogFooter>
												<span className="text-red-500 text-center w-full">
													{
														editCylinderULForm.formState.errors.root
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
												Delete cylinder purchase log?
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
													handleDeleteCylinderLog(deletingId as string)
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
													fetchBuildingCylinderULs();
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
				</Card>
				<Footer />
			</main>
		</>
	);
};

export default ManageCylinderULsPage;
