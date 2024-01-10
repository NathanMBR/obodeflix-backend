import { app } from "./server";
import { PORT } from "@/config";
import { prisma } from "./database";

const main = async () => {
    await prisma.$connect();

    app.listen(
        PORT,
        /* eslint-disable-next-line no-console */
        () => console.log(`Server running on port ${PORT}`)
    );
};

main();