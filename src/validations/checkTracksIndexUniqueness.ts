import { Track } from "@prisma/client";

type TrackDatabaseFields =
  "id" |
  "seasonId" |
  "createdAt" |
  "updatedAt" |
  "deletedAt";

type ComparableTrack = Track | Omit<Track, TrackDatabaseFields>

export const checkTracksIndexUniqueness = (tracks: Array<ComparableTrack>) => {
    const audioIndexes = tracks.filter(track => track.type === "AUDIO").map(track => track.index);
    const subtitleIndexes = tracks.filter(track => track.type === "SUBTITLE").map(track => track.index);

    const uniqueAudioIndexes = new Set(audioIndexes);
    const uniqueSubtitleIndexes = new Set(subtitleIndexes);

    const areAudioIndexesUnique = uniqueAudioIndexes.size === audioIndexes.length;
    const areSubtitleIndexesUnique = uniqueSubtitleIndexes.size === subtitleIndexes.length;

    const areIndexesUnique = areAudioIndexesUnique && areSubtitleIndexesUnique;

    return areIndexesUnique;
};