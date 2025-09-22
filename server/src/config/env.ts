import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || 8000;
export const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;
export const JWT_KEY = process.env.JWT_KEY;
