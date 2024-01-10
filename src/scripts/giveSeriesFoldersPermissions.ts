import childProcess from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

import {
    SERIES_BASE_URL,
    SERIES_FOLDER_IGNORE_ITEMS
} from "@/config";

type Folders = Array<string>;
let foldersCache: Folders = [];
const getFoldersCache = async (): Promise<Folders> => {
    if (!foldersCache.length) {
        const seriesListRaw = await fs.readdir(SERIES_BASE_URL);
        const itemsToExclude = SERIES_FOLDER_IGNORE_ITEMS;

        foldersCache = seriesListRaw.filter(
            series => !itemsToExclude.includes(series) && !series.endsWith(".")
        );
    }

    return foldersCache;
};

const main = async () => {
    const folders = await getFoldersCache();

    for (const folder of folders) {
        const folderPath = path.join(SERIES_BASE_URL, folder);
        childProcess.execSync(`chmod -R 777 "${folderPath}"`);
    }
};

main();