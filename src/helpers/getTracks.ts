import path from "node:path";

import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegBinaryPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobeBinaryPath } from "@ffprobe-installer/ffprobe";

import { SERIES_BASE_URL } from "@/config";

ffmpeg.setFfmpegPath(ffmpegBinaryPath);
ffmpeg.setFfprobePath(ffprobeBinaryPath);

type Track = {
    index: number;
    title: string;
}

type TracksList = Record<"video" | "audio" | "subtitle", Array<Track>>

export const getTracks = async (videoPath: string) => new Promise<TracksList>(
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
                                index: stream.index,
                                title: stream.tags.title || "unknown"
                            };

                            return videoTrack;
                        }
                    );

                const audioTracks = rawAudioTracks
                    .filter(stream => !!stream.tags)
                    .map(
                        stream => {
                            const audioTrack = {
                                index: stream.index - rawVideoTracks.length,
                                title: stream.tags.title || "unknown"
                            };

                            return audioTrack;
                        }
                    );

                const subtitleTracks = rawSubtitleTracks
                    .filter(stream => !!stream.tags)
                    .map(
                        stream => {
                            const subtitleTrack = {
                                index: stream.index - rawVideoTracks.length - rawAudioTracks.length,
                                title: stream.tags.title || "unknown"
                            };

                            return subtitleTrack;
                        }
                    );

                const tracksList = {
                    video: videoTracks,
                    audio: audioTracks,
                    subtitle: subtitleTracks
                };

                return resolve(tracksList);
            }
        );
    }
);