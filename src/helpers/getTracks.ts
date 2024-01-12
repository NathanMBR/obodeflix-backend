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
                                title: stream.tags.title as string || "unknown",
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
                                title: stream.tags.title as string || "unknown",
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
                                title: stream.tags.title as string || "unknown",
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