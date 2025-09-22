import express from "express";
import cors from "cors";
import routes from "./routes/routes";
import { connect, connection } from "mongoose";
import { DB_CONNECTION_URI, PORT } from "./config/env";
import cookieParser from "cookie-parser";

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
	res.send("Welcome to the Building Management System API");
});

app.use("/api", routes);

const serverStart = async () => {
	try {
		await connect(DB_CONNECTION_URI!);
		console.log(`Database connection established: ${connection.host}`);

		const server = app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});

		const serverShutdown = (signal: string) => {
			console.log(
				`\n${signal} signal received. Shutting down server and terminating DB connection...`
			);

			server.close((error) => {
				if (error) {
					console.error("Error shutting server down:", error);
					process.exit(1);
				}

				connection
					.close(false)
					.then(() => {
						console.log("Database connection terminated");
						process.exit(0);
					})
					.catch((error) => {
						console.error("Error terminating database connection:", error);
						process.exit(1);
					});
			});
		};

		process.on("SIGINT", () => {
			serverShutdown("SIGINT");
		});
		process.on("SIGTERM", () => {
			serverShutdown("SIGTERM");
		});
	} catch (error: any) {
		console.error("Failed to start server:", error.message);
		process.exit(1);
	}
};

serverStart();
