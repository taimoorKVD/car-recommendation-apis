import qdrant from "../config/qdrant.js";
import { generateEmbedding } from "./embedding.service.js";
import { computeDynamicAlpha } from "./intent.service.js";
import { interpretQuery } from "./queryInterpreter.service.js";
import { explainCar } from "./explanation.service.js";

function combineVectors(userVector, queryVector, alpha) {
    if (!userVector) return queryVector;
    return userVector.map(
        (x, i) => alpha * x + (1 - alpha) * queryVector[i]
    );
}

export async function recommendCarsForUser(userId, query) {
    // 1️⃣ Interpret query dynamically (NEW)
    const intent = await interpretQuery(query);

    // 2️⃣ Embeddings
    const queryVector = await generateEmbedding(query);

    const points = await qdrant.retrieve("users", { ids: [userId] });
    const userVector = points.length ? points[0].vector : null;

    const alpha = computeDynamicAlpha(userVector, queryVector);
    const finalVector = combineVectors(userVector, queryVector, alpha);

    // 3️⃣ Candidate generation
    const results = await qdrant.search("cars", {
        vector: finalVector,
        limit: 20,
    });

    let cars = results.map(r => ({
        ...r.payload,
        score: r.score,
    }));

    // 4️⃣ Hard constraints
    if (intent.hard_constraints?.exclude?.length) {
        const excluded = intent.hard_constraints.exclude.map(e => e.value);
        cars = cars.filter(c => !excluded.includes(c.type));
    }

    // 5️⃣ Soft preferences
    if (intent.soft_preferences?.type) {
        cars = cars.map(c => ({
            ...c,
            score:
                c.type === intent.soft_preferences.type
                    ? c.score + 0.15
                    : c.score,
        }));
    }

    // 6️⃣ Objectives
    const priceObjective = intent.objectives.find(o => o.field === "price");
    if (priceObjective?.direction === "asc") {
        cars.sort((a, b) => a.price - b.price);
    }
    if (priceObjective?.direction === "desc") {
        cars.sort((a, b) => b.price - a.price);
    }

    // 7️⃣ Explanation (context-aware)
    return cars.slice(0, 5).map(car => ({
        ...car,
        explanation: explainCar({
            car,
            intent,
            allCars: cars,
        }),
        debug: {
            alpha,
            intent,
        },
    }));
}
