import { Router } from "express";
import path from "path";
import fs from "fs/promises";
import exiftool from "node-exiftool";
import exifBin from "dist-exiftool";

import { prisma } from "@/database";

const exif = new exiftool.ExiftoolProcess(exifBin);

import {
    ensureAuthentication,
    ensureModeration
} from "@/middlewares";
import {
    ValidationError,
    NotFoundError,
    InternalServerError
} from "@/errors";
import {
    getTransformedDuration,
    handleControllerError,
    readFoldersRecursively
} from "@/helpers";
import {
    SERIES_BASE_URL,
    SERIES_FOLDER_IGNORE_ITEMS
} from "@/config";

type RouterReturn = ReturnType<typeof Router>;
const rawRoutes: RouterReturn = Router();

type Folders = Array<string>;
const foldersCache: Folders = [];
const getFoldersCache = async (): Promise<Folders> => {
    if (!foldersCache.length) {
        const folders = await readFoldersRecursively(SERIES_BASE_URL, SERIES_FOLDER_IGNORE_ITEMS);
        foldersCache.push(...folders);
    }

    return foldersCache;
};

const validEpisodeFormats: Array<string> = [
    ".mkv",
    ".mp4",
    ".avi"
];

rawRoutes.get(
    "/raw/folder/all",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at get all folders route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const folders = await getFoldersCache();

            return response
                .status(200)
                .json(folders);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

rawRoutes.get(
    "/raw/folder/get/:index",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at get all folders route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const folderIndex = Number(request.params.index);
            if (Number.isNaN(folderIndex))
                return response.status(400).json(
                    new ValidationError(["The folder index must be a number"])
                );

            if (folderIndex < 0)
                return response.status(400).json(
                    new ValidationError(["The folder index must be greater than 0"])
                );

            const folders = await getFoldersCache();
            const folder = folders[folderIndex];
            if (!folder)
                return response.status(404).json(
                    new NotFoundError("Folder index not found")
                );

            const folderPath = path.join(SERIES_BASE_URL, folder);
            const folderEpisodesRaw = await fs.readdir(folderPath, { withFileTypes: true });

            const folderEpisodes = folderEpisodesRaw.filter(
                content => {
                    const isFile = content.isFile();
                    const hasValidFormat = validEpisodeFormats.some(
                        format => content.name.endsWith(format)
                    );

                    return isFile && hasValidFormat;
                }
            );

            interface EpisodeFile {
                filename: string;
                path: string;
                duration: number;
            }
            const episodesFiles: Array<EpisodeFile> = [];

            /* eslint-disable no-await-in-loop */
            await exif.open();
            for (const episodeFile of folderEpisodes) {
                const episodePath = path.join(folderPath, episodeFile.name);
                const episodeMetadata = await exif.readMetadata(episodePath, ["-File:all"]);
                const episodeDuration = getTransformedDuration(
                    episodeMetadata.data[0].Duration
                );

                episodesFiles.push(
                    {
                        filename: episodeFile.name,
                        path: episodePath.split(SERIES_BASE_URL)[1],
                        duration: episodeDuration
                    }
                );
            }
            await exif.close();
            /* eslint-enable no-await-in-loop */

            return response
                .status(200)
                .json(episodesFiles);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

rawRoutes.get(
    "/raw/folder/unused",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at get all unused folders route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            /* eslint-disable no-await-in-loop */
            const folders = await getFoldersCache();
            const unusedFolders: Array<string> = [];

            const unusedFoldersSearch = await Promise.all(
                folders.map(
                    folder => prisma.episode.findFirst(
                        {
                            select: {
                                id: true,
                                path: true
                            },

                            where: {
                                path: {
                                    contains: folder
                                },

                                deletedAt: null
                            }
                        }
                    )
                )
            );

            for (let i = 0; i < unusedFoldersSearch.length; i++) {
                const isFolderUsed = unusedFoldersSearch[i];
                if (!isFolderUsed)
                    unusedFolders.push(folders[i]);
            }

            return response
                .status(200)
                .json(unusedFolders);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

export { rawRoutes };