import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import HeaderDefault from "@/components/HeaderDefault";
import Footer from "@/components/Footer";
import { adminAuthCheckApi, flatAuthCheckApi, adminSignInApi, flatSignInApi } from "@/api/authApi";

const FlatSignInSchema = z.object({
	flatNumber: z.string().nonempty("Flat number can't be empty"),
	phone: z.string().nonempty("Phone number can't be empty"),
});

export type FlatSignInFormDataType = z.infer<typeof FlatSignInSchema>;

const AdminSignInSchema = z.object({
	email: z.email("Please enter a valid email address").nonempty("Email can't be empty"),
	password: z.string().nonempty("Password can't be empty"),
});

export type AdminSignInFormDataType = z.infer<typeof AdminSignInSchema>;

const SignInPage: React.FC = () => {
	const navigate = useNavigate();
	useEffect(() => {
		const adminAuthCheck = async () => {
			const response = await adminAuthCheckApi();
			if (response.success) {
				navigate("/admin-dashboard");
			}
		};
		const flatAuthCheck = async () => {
			const response = await flatAuthCheckApi();
			if (response.success) {
				navigate("/flat-dashboard");
			}
		};

		adminAuthCheck();
		flatAuthCheck();
	}, [navigate]);

	const [isFlatSignIn, setIsFlatSignIn] = useState(true);
	const [isFormLoading, setIsFormLoading] = useState(false);

	const flatForm = useForm<FlatSignInFormDataType>({
		resolver: zodResolver(FlatSignInSchema),
		mode: "onSubmit",
	});

	const adminForm = useForm<AdminSignInFormDataType>({
		resolver: zodResolver(AdminSignInSchema),
		mode: "onSubmit",
	});

	const handleFlatSignIn = async (formData: FlatSignInFormDataType) => {
		setIsFormLoading(true);
		const response = await flatSignInApi(formData);
		if (response.success) {
			navigate("/flat-dashboard");
		} else {
			flatForm.setError("root", {
				message: response.error || "Failed to sign in",
			});
		}
		setIsFormLoading(false);
	};

	const handleAdminSignIn = async (formData: AdminSignInFormDataType) => {
		setIsFormLoading(true);
		const response = await adminSignInApi(formData);
		if (response.success) {
			navigate("/admin-dashboard");
		} else {
			adminForm.setError("root", {
				message: response.error || "Failed to sign in",
			});
		}
		setIsFormLoading(false);
	};

	return (
		<>
			<main className="flex flex-col min-h-screen gap-6">
				<HeaderDefault />
				<div className="flex grow justify-center items-center">
					<Card className="w-full max-w-md">
						<CardHeader>
							<CardTitle className="">
								{isFlatSignIn ? "Sign In - Flat Resident" : "Sign In - Admin"}
							</CardTitle>
							<CardDescription className="">
								Enter your credentials to sign in
							</CardDescription>
							<CardAction>
								<Button
									variant="outline"
									onClick={() => {
										flatForm.reset();
										adminForm.reset();
										setIsFlatSignIn(!isFlatSignIn);
									}}
								>
									{isFlatSignIn ? "Sign in as Admin" : "Sign in as Flat Resident"}
								</Button>
							</CardAction>
						</CardHeader>
						<CardContent>
							{isFlatSignIn ? (
								<form
									className="flex flex-col gap-6"
									onSubmit={flatForm.handleSubmit(handleFlatSignIn)}
									action=""
									method=""
								>
									<div className="flex flex-col gap-2">
										<Label htmlFor="flatNumber">Flat Number</Label>
										<Input type="text" {...flatForm.register("flatNumber")} />
										{flatForm.formState.errors.flatNumber && (
											<span className="text-xs text-red-500 font-semibold">
												{flatForm.formState.errors.flatNumber.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="phone">Phone Number</Label>
										<Input type="text" {...flatForm.register("phone")} />
										{flatForm.formState.errors.phone && (
											<span className="text-xs text-red-500 font-semibold">
												{flatForm.formState.errors.phone.message}
											</span>
										)}
									</div>
									<Button type="submit" disabled={isFormLoading}>
										{isFormLoading ? "Loading..." : "Sign In"}
									</Button>
								</form>
							) : (
								<form
									className="flex flex-col gap-6"
									onSubmit={adminForm.handleSubmit(handleAdminSignIn)}
									action=""
									method=""
								>
									<div className="flex flex-col gap-2">
										<Label htmlFor="email">Email</Label>
										<Input type="email" {...adminForm.register("email")} />
										{adminForm.formState.errors.email && (
											<span className="text-xs text-red-500 font-semibold">
												{adminForm.formState.errors.email.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="password">Password</Label>
										<Input
											type="password"
											{...adminForm.register("password")}
										/>
										{adminForm.formState.errors.password && (
											<span className="text-xs text-red-500 font-semibold">
												{adminForm.formState.errors.password.message}
											</span>
										)}
									</div>
									<Button type="submit" disabled={isFormLoading}>
										{isFormLoading ? "Loading..." : "Sign In"}
									</Button>
								</form>
							)}
						</CardContent>
						{adminForm.formState.errors.root && (
							<CardFooter>
								<span className="text-red-500 text-center w-full">
									{adminForm.formState.errors.root.message}
								</span>
							</CardFooter>
						)}
						{flatForm.formState.errors.root && (
							<CardFooter>
								<span className="text-red-500 text-center w-full">
									{flatForm.formState.errors.root.message}
								</span>
							</CardFooter>
						)}
					</Card>
				</div>
				<Footer />
			</main>
		</>
	);
};

export default SignInPage;
