// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import SignInPage from "./pages/SignInPage";
import AdminDashPage from "./pages/AdminDashPage";
import FlatDashPage from "./pages/FlatDashPage";
import ManageCylinderPLsPage from "./pages/ManageCylinderPLsPage";
import ManageMosqueContributionsPage from "./pages/ManageMosqueContributionsPage";
import ManageFlatsPage from "./pages/ManageFlatsPage";
import ManageGasUsagesPage from "./pages/ManageGasUsagesPage";
import ManageServiceChargesPage from "./pages/ManageServiceChargesPage";
import ManageCylinderULsPage from "./pages/ManageCylinderULsPage";
import ViewGasUsagesPage from "./pages/ViewFlatGasUsagesPage";
import ViewContributionsPage from "./pages/ViewContributionsPage";
import ViewServiceChargesPage from "./pages/ViewServiceChargesPage";

function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<Navigate to={"/sign-in"} replace />} />
				<Route path="/sign-in" element={<SignInPage />} />
				<Route path="/admin-dashboard" element={<AdminDashPage />} />
				<Route path="/flat-dashboard" element={<FlatDashPage />} />
				<Route path="/manage-cylinder-pls" element={<ManageCylinderPLsPage />} />
				<Route path="/manage-cylinder-uls" element={<ManageCylinderULsPage />} />
				<Route
					path="/manage-mosque-contributions"
					element={<ManageMosqueContributionsPage />}
				/>
				<Route path="/manage-flats" element={<ManageFlatsPage />} />
				<Route path="/manage-gas-usages" element={<ManageGasUsagesPage />} />
				<Route path="/manage-service-charges" element={<ManageServiceChargesPage />} />
				<Route path="/view-gas-usages" element={<ViewGasUsagesPage />} />
				<Route path="/view-mosque-contributions" element={<ViewContributionsPage />} />
				<Route path="/view-service-charges" element={<ViewServiceChargesPage />} />
			</Routes>
			<Toaster closeButton position="top-center" />
		</>
	);

	// const [count, setCount] = useState(0);

	// return (
	// 	<>
	// 		<div>
	// 			<a href="https://vite.dev" target="_blank">
	// 				<img src={viteLogo} className="logo" alt="Vite logo" />
	// 			</a>
	// 			<a href="https://react.dev" target="_blank">
	// 				<img src={reactLogo} className="logo react" alt="React logo" />
	// 			</a>
	// 		</div>
	// 		<h1>Vite + React</h1>
	// 		<div className="card">
	// 			<button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
	// 			<p>
	// 				Edit <code>src/App.tsx</code> and save to test HMR
	// 			</p>
	// 		</div>
	// 		<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
	// 	</>
	// );
}

export default App;
