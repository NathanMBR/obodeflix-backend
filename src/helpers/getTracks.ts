import path from "node:path";

import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegBinaryPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobeBinaryPath } from "@ffprobe-installer/ffprobe";

import { SERIES_BASE_URL } from "@/config";

ffmpeg.setFfmpegPath(ffmpegBinaryPath);
ffmpeg.setFfprobePath(ffprobeBinaryPath);

type Track = {
    title: string;
    type: "VIDEO" | "AUDIO" | "SUBTITLE";
    index: number;
}

const getTrackTitle = (title?: string, languageAlias?: string): string => {
    const defaultTitle = "unknown";
    const languages = {
        por: "Português",
        spa: "Espanhol",
        jpn: "Japonês",
        eng: "Inglês"
    };

    if (title)
        return title;

    if (!languageAlias)
        return defaultTitle;

    const language = languages[languageAlias];
    if (!language)
        return defaultTitle;

    return language;
};

export const getTracks = async (videoPath: string) => new Promise<Array<Track>>(
    (resolve, reject) => {
        const fileAbsolutePath = path.join(SERIES_BASE_URL, videoPath);

        ffmpeg.ffprobe(
            fileAbsolutePath,
            (error, metadata) => {
                if (error)
                    return reject(error);

                const rawVideoTracks = metadata.streams.filter(stream => stream.codec_type === "video");
                const rawAudioTracks = metadata.streams.filter(stream => stream.codec_type === "audio");
                const rawSubtitleTracks = metadata.streams.filter(stream => stream.codec_type === "subtitle");

                const videoTracks = rawVideoTracks
                    .filter(stream => !!stream.tags)
                    .map(
                        stream => {
                            const videoTrack = {
                                title: getTrackTitle(stream.tags.title, stream.tags.language),
                                type: "VIDEO" as const,
                                index: stream.index
                            };

                            return videoTrack;
                        }
                    );

                const audioTracks = rawAudioTracks
                    .filter(stream => !!stream.tags)
                    .map(
                        stream => {
                            const audioTrack = {
                                title: getTrackTitle(stream.tags.title, stream.tags.language),
                                type: "AUDIO" as const,
                                index: stream.index - rawVideoTracks.length
                            };

                            return audioTrack;
                        }
                    );

                const subtitleTracks = rawSubtitleTracks
                    .filter(stream => !!stream.tags)
                    .map(
                        stream => {
                            const subtitleTrack = {
                                title: getTrackTitle(stream.tags.title, stream.tags.language),
                                type: "SUBTITLE" as const,
                                index: stream.index - rawVideoTracks.length - rawAudioTracks.length
                            };

                            return subtitleTrack;
                        }
                    );

                const tracksList: Array<Track> = [
                    ...videoTracks,
                    ...audioTracks,
                    ...subtitleTracks
                ];

                return resolve(tracksList);
            }
        );
    }
);