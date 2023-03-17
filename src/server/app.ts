import express from "express";
import cors from "cors";
import {
    userRoutes,
    seriesRoutes,
    tagRoutes,
    seasonRoutes,
    episodeRoutes,
    commentRoutes
} from "@/routes";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(userRoutes);
app.use(seriesRoutes);
app.use(tagRoutes);
app.use(seasonRoutes);
app.use(episodeRoutes);
app.use(commentRoutes);

export { app };