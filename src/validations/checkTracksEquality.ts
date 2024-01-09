import { Track } from "@prisma/client";

type TrackDatabaseFields =
  "id" |
  "seasonId" |
  "createdAt" |
  "updatedAt" |
  "deletedAt";

type ComparableTrack = Track | Omit<Track, TrackDatabaseFields>

export const checkTracksEquality = (trackA: ComparableTrack, trackB: ComparableTrack) =>
    trackA.title === trackB.title &&
    trackA.type === trackB.type &&
    trackA.index === trackB.index;