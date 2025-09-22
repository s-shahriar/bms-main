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
	// DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	// DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import HeaderAdmin from "@/components/HeaderAdmin";
import Footer from "@/components/Footer";
import { adminAuthCheckApi } from "@/api/authApi";
import { fetchBuildingsApi } from "@/api/buildingApi";
import { fetchBuildingFlatsApi, updateFlatApi } from "@/api/flatApi";

const EditFlatSchema = z.object({
	ownerName: z.string("Owner's name can't be anything other than a string").optional(),
	ownerPhone: z.string("Owner's phone number can't be anything other than a string").optional(),
	ownerEmail: z.string("Owner's email can't be anything other than a string").optional(),
	renterName: z.string("Renter's name can't be anything other than a string").optional(),
	renterPhone: z.string("Renter's phone number can't be anything other than a string").optional(),
	renterEmail: z.string("Renter's email can't be anything other than a string").optional(),
	status: z.string("Please select a status"),
});
export type EditFlatData = z.infer<typeof EditFlatSchema>;

const ManageFlatsPage: React.FC = () => {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [buildings, setBuildings] = useState([]);
	const [currentBuildingId, setCurrentBuildingId] = useState<string | null>(null);
	const [flats, setFlats] = useState([]);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const navigate = useNavigate();

	const fetchBuildingFlats = async (buildingId: string) => {
		const response = await fetchBuildingFlatsApi(buildingId);
		if (response.success) {
			setFlats(response.data);
		} else {
			toast("Failed to fetch flats", {
				description: response.error || "Some error is preventing flats from being fetched",
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
			fetchBuildingFlats(currentBuildingId);
		}
	}, [currentBuildingId]);

	const editFlatForm = useForm<EditFlatData>({
		resolver: zodResolver(EditFlatSchema),
		mode: "onSubmit",
	});

	const handleEditFlat = async (flatId: string, formData: EditFlatData) => {
		setIsFormLoading(true);
		const response = await updateFlatApi(flatId, formData);
		if (response.success) {
			fetchBuildingFlats(currentBuildingId as string);
			toast("Flat has been edited", {
				description: "Check the table for more options",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
			setIsEditDialogOpen(false);
			editFlatForm.reset();
		} else {
			editFlatForm.setError("root", {
				message: response.error || "Failed to edit flat",
			});
		}
		setIsFormLoading(false);
	};

	return (
		<>
			<main className="flex flex-col min-h-screen gap-6">
				<HeaderAdmin />
				<Card className="flex grow container mx-auto">
					<CardHeader>
						<CardTitle className="text-2xl">Manage Flats</CardTitle>
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
						<Card className="">
							<CardHeader>
								<CardTitle className="">Flat Table</CardTitle>
								<CardAction>
									<Button
										onClick={() =>
											fetchBuildingFlats(currentBuildingId as string)
										}
										variant={"outline"}
									>
										Refresh
									</Button>
								</CardAction>
							</CardHeader>
							<CardContent>
								<Table>
									<TableCaption>
										{flats.length > 0 ? `${flats.length} Flat(s)` : "No Data"}
									</TableCaption>
									<TableHeader>
										<TableRow className="bg-muted">
											<TableHead>Flat ID</TableHead>
											<TableHead>Flat Number</TableHead>
											<TableHead>Owner's Name</TableHead>
											<TableHead>Owner's Phone</TableHead>
											<TableHead>Owner's Email</TableHead>
											<TableHead>Renter's Name</TableHead>
											<TableHead>Renter's Phone</TableHead>
											<TableHead>Renter's Email</TableHead>
											<TableHead className="text-center">Status</TableHead>
											<TableHead className="text-center">Action</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{flats.map((flat: any, index) => (
											<TableRow key={index}>
												<TableCell>{flat._id}</TableCell>
												<TableCell>{flat.flatNumber}</TableCell>
												<TableCell>{flat.ownerName}</TableCell>
												<TableCell>{flat.ownerPhone}</TableCell>
												<TableCell>{flat.ownerEmail}</TableCell>
												<TableCell>{flat.renterName}</TableCell>
												<TableCell>{flat.renterPhone}</TableCell>
												<TableCell>{flat.renterEmail}</TableCell>
												<TableCell className="text-center">
													{flat.status ? "Occupied" : "Unoccupied"}
												</TableCell>
												<TableCell className="text-center">
													<button
														className="font-semibold hover:underline cursor-pointer"
														onClick={() => {
															setEditingId(flat._id);
															editFlatForm.reset({
																ownerName: flat.ownerName,
																ownerPhone: flat.ownerPhone,
																ownerEmail: flat.ownerEmail,
																renterName: flat.renterName,
																renterPhone: flat.renterPhone,
																renterEmail: flat.renterEmail,
																status: flat.status
																	? "true"
																	: "false",
															});
															setIsEditDialogOpen(true);
														}}
													>
														Edit
													</button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
								<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
									<DialogContent className="">
										<DialogHeader>
											<DialogTitle className="">Edit Flat</DialogTitle>
											<DialogDescription>
												Please make sure all information is correct before
												proceeding
											</DialogDescription>
										</DialogHeader>
										<form
											className="flex flex-col gap-6 mt-2"
											onSubmit={editFlatForm.handleSubmit((formData) => {
												handleEditFlat(editingId as string, formData);
											})}
											action=""
											method=""
										>
											<div className="flex flex-col gap-2">
												<Label htmlFor="ownerName">Owner's Name</Label>
												<Input
													type="text"
													{...editFlatForm.register("ownerName")}
												/>
												{editFlatForm.formState.errors.ownerName && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editFlatForm.formState.errors.ownerName
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="ownerPhone">Owner's Phone</Label>
												<Input
													type="tel"
													{...editFlatForm.register("ownerPhone")}
												/>
												{editFlatForm.formState.errors.ownerPhone && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editFlatForm.formState.errors.ownerPhone
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="ownerEmail">Owner's Email</Label>
												<Input
													type="email"
													{...editFlatForm.register("ownerEmail")}
												/>
												{editFlatForm.formState.errors.ownerEmail && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editFlatForm.formState.errors.ownerEmail
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="renterName">Renter's Name</Label>
												<Input
													type="text"
													{...editFlatForm.register("renterName")}
												/>
												{editFlatForm.formState.errors.renterName && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editFlatForm.formState.errors.renterName
																.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="renterPhone">Renter's Phone</Label>
												<Input
													type="tel"
													{...editFlatForm.register("renterPhone")}
												/>
												{editFlatForm.formState.errors.renterPhone && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editFlatForm.formState.errors
																.renterPhone.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="renterEmail">Renter's Email</Label>
												<Input
													type="email"
													{...editFlatForm.register("renterEmail")}
												/>
												{editFlatForm.formState.errors.renterEmail && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editFlatForm.formState.errors
																.renterEmail.message
														}
													</span>
												)}
											</div>
											<div className="flex flex-col gap-2">
												<Label htmlFor="status">Status</Label>
												<Select
													value={editFlatForm.watch("status")}
													onValueChange={(value) =>
														editFlatForm.setValue("status", value)
													}
													// defaultValue=""
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select flat" />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>Flats</SelectLabel>
															<SelectItem value="true">
																Occupied
															</SelectItem>
															<SelectItem value="false">
																Unoccupied
															</SelectItem>
														</SelectGroup>
													</SelectContent>
												</Select>
												{editFlatForm.formState.errors.status && (
													<span className="text-xs text-red-500 font-semibold">
														{
															editFlatForm.formState.errors.status
																.message
														}
													</span>
												)}
											</div>
											<Button type="submit" disabled={isFormLoading}>
												{isFormLoading ? "Loading..." : "Save Changes"}
											</Button>
										</form>
										{editFlatForm.formState.errors.root && (
											<DialogFooter>
												<span className="text-red-500 text-center w-full">
													{editFlatForm.formState.errors.root.message}
												</span>
											</DialogFooter>
										)}
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

export default ManageFlatsPage;
