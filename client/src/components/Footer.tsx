const Footer: React.FC = () => {
	return (
		<>
			<footer className="flex bg-black p-4 justify-center items-center">
				<span className="text-sm text-white">
					&copy; {new Date().getFullYear()} Navana City Dale Portal. All rights reserved.
				</span>
			</footer>
		</>
	);
};

export default Footer;
