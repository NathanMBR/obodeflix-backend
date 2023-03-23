export const getTransformedDuration = (duration: string) => {
    const splittedDuration = duration.split(":");
    const hours = Number(splittedDuration[0]) * 60 * 60;
    const minutes = Number(splittedDuration[1]) * 60;
    const seconds = Number(splittedDuration[2]);

    const durationInSeconds = hours + minutes + seconds;
    return durationInSeconds;
};