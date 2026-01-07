import UserEvent from "../models/UserEvent.js";
import Car from "../models/Car.js";
import {generateEmbedding} from "./embedding.service.js";
import {timeDecayFactor} from "../utils/timeDecay.util.js";

const EVENT_WEIGHTS = {
    search: 1,
    click: 3,
    book: 10,
};

function averageVectors(vectors) {
    const size = vectors[0].length;
    const avg = new Array(size).fill(0);

    for (const v of vectors) {
        for (let i = 0; i < size; i++) {
            avg[i] += v[i];
        }
    }

    return avg.map(x => x / vectors.length);
}

function normalize(vector) {
    const norm = Math.sqrt(vector.reduce((s, x) => s + x * x, 0));
    return vector.map(x => x / norm);
}

export async function buildUserEmbedding(userId) {
    const events = await UserEvent.findAll({
        where: {userId},
        order: [["createdAt", "DESC"]],
    });

    if (!events.length) return null;

    const weightedVectors = [];

    for (const event of events) {
        let text = "";

        if (event.eventType === "search") {
            text = event.query;
        } else {
            const car = await Car.findByPk(event.carId);
            text = `${car.brand} ${car.model} ${car.type} ${car.description}`;
        }

        const embedding = await generateEmbedding(text);

        const baseWeight = EVENT_WEIGHTS[event.eventType];
        const decay = timeDecayFactor(event.createdAt);
        const finalWeight = Math.max(1, Math.round(baseWeight * decay));

        for (let i = 0; i < finalWeight; i++) {
            weightedVectors.push(embedding);
        }
    }

    const avg = averageVectors(weightedVectors);
    return normalize(avg);
}
