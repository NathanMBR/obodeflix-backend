import path from "node:path";
import fs from "node:fs/promises";

export const readFoldersRecursively = async (folderPath: string, foldersToIgnore: Array<string> = []): Promise<Array<string>> => {
    const folders: Array<string> = [];

    const direntList = await fs.readdir(folderPath, { withFileTypes: true });
    const filteredFolders = direntList.filter(
        dirent => {
            const isDirectory = dirent.isDirectory();
            const doesNameEndsWithDot = dirent.name.endsWith(".");
            const isIgnoredFolder = foldersToIgnore.includes(dirent.name);

            return isDirectory && !doesNameEndsWithDot && !isIgnoredFolder;
        }
    );

    for (const folder of filteredFolders) {
        /* eslint-disable no-await-in-loop */
        const currentFolderPath = path.join(folderPath, folder.name);
        const subFolders = await readFoldersRecursively(currentFolderPath);
        folders.push(folder.name, ...subFolders.map(subFolder => path.join(folder.name, subFolder)));
        /* eslint-enable no-await-in-loop */
    }

    return folders;
};