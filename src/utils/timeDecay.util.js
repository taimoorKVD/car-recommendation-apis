export function timeDecayFactor(eventDate, lambda = 0.05) {
    const now = new Date();
    const ageInDays =
        (now.getTime() - new Date(eventDate).getTime()) / (1000 * 60 * 60 * 24);

    return Math.exp(-lambda * ageInDays);
}
