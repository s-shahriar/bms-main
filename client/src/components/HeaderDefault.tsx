import { Link } from "react-router-dom";

const HeaderDefault: React.FC = () => {
	return (
		<>
			<header className="flex items-center bg-black text-white p-4">
				<Link to="/sign-in">
					<h1 className="text-2xl font-semibold">Navana City Dale Portal</h1>
				</Link>
			</header>
		</>
	);
};

export default HeaderDefault;
