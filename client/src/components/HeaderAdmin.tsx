import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { adminSignOutApi } from "@/api/authApi";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	// DropdownMenuLabel,
	// DropdownMenuPortal,
	DropdownMenuSeparator,
	// DropdownMenuShortcut,
	// DropdownMenuSub,
	// DropdownMenuSubContent,
	// DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HeaderAdmin: React.FC = () => {
	const navigate = useNavigate();

	const handleSignOut = async () => {
		const response = await adminSignOutApi();
		if (response.success) {
			navigate("/sign-in");
		} else {
			toast("Failed to sign out", {
				description: response.error || "Please try again",
				action: {
					label: "OK",
					onClick: () => {},
				},
			});
		}
	};

	return (
		<>
			<header className="bg-black text-white p-4">
				<div className="flex container mx-auto items-center justify-between">
					<Link to="/admin-dashboard">
						<h1 className="text-2xl font-semibold">Navana City Dale Portal</h1>
					</Link>
					<nav>
						<ul className="flex gap-4 items-center">
							<li>
								<span>Signed in as Admin</span>
							</li>
							<li>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												// width="16"
												// height="16"
												// fill="currentColor"
												// class="bi bi-list"
												viewBox="0 0 16 16"
											>
												<path
													// fill-rule="evenodd"
													d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
												/>
											</svg>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-56" align="start">
										<DropdownMenuGroup>
											{/* <Link
												className="w-full font-semibold"
												to={"/manage-bills"}
											>
												<DropdownMenuItem>Manage Bills</DropdownMenuItem>
											</Link> */}
											<Link
												className="w-full font-semibold"
												to={"/manage-mosque-contributions"}
											>
												<DropdownMenuItem>
													Manage Mosque Contributions
												</DropdownMenuItem>
											</Link>
											<Link
												className="w-full font-semibold"
												to={"/manage-service-charges"}
											>
												<DropdownMenuItem>
													Manage Service Charges
												</DropdownMenuItem>
											</Link>
											<Link
												className="w-full font-semibold"
												to={"/manage-cylinder-pls"}
											>
												<DropdownMenuItem>
													Manage Cylinder Purchase Log
												</DropdownMenuItem>
											</Link>
											<Link
												className="w-full font-semibold"
												to={"/manage-cylinder-uls"}
											>
												<DropdownMenuItem>
													Manage Cylinder Usage Log
												</DropdownMenuItem>
											</Link>
											<Link
												className="w-full font-semibold"
												to={"/manage-flats"}
											>
												<DropdownMenuItem>Manage Flats</DropdownMenuItem>
											</Link>
											<Link
												className="w-full font-semibold"
												to={"/manage-gas-usages"}
											>
												<DropdownMenuItem>
													Manage Gas Usage Records
												</DropdownMenuItem>
											</Link>
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="font-semibold"
											onClick={handleSignOut}
										>
											Log Out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</li>
						</ul>
					</nav>
				</div>
			</header>
		</>
	);
};

export default HeaderAdmin;
