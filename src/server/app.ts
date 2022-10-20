import express from "express";
import cors from "cors";
import {
    userRoutes,
    seriesRoutes
} from "@/routes";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(userRoutes);
app.use(seriesRoutes);

export { app };