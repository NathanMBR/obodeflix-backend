import { Track } from "@prisma/client";

type TrackDatabaseFields =
  "id" |
  "seasonId" |
  "createdAt" |
  "updatedAt" |
  "deletedAt";

type ComparableTrack = Track | Omit<Track, TrackDatabaseFields>

export const checkTracksIndexUniqueness = (tracks: Array<ComparableTrack>) => {
    const indexes = tracks.map(track => track.index);
    const uniqueIndexes = new Set(indexes);
    const areTracksIndexesUnique = indexes.length === uniqueIndexes.size;

    return areTracksIndexesUnique;
};