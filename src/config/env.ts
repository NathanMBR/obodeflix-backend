import { config } from "dotenv";

config();

export const PORT = Number(process.env.PORT) || 3000;
export const SECRET = String(process.env.SECRET);
export const SERIES_BASE_URL = String(process.env.SERIES_BASE_URL);