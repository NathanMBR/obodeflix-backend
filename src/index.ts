import { app } from "./server";
import { PORT } from "@/config";

app.listen(
    PORT,
    /* eslint-disable no-console */
    () => console.log(`Server running on port ${PORT}`)
);