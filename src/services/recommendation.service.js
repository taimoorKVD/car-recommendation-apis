import qdrant from "../config/qdrant.js";
import {generateEmbedding} from "./embedding.service.js";
import {computeDynamicAlpha} from "./intent.service.js";
import {interpretQuery} from "./queryInterpreter.service.js";
import {explainCar} from "./explanation.service.js";
import UserEvent from "../models/UserEvent.js";
import {EVENT_WEIGHTS} from "../config/eventWeights.js";
import {buildVehicleTypeClarification} from "./clarification.service.js";
import {getActiveSession, resolveSession, saveSession,} from "./session.service.js";

import {mergeIntent} from "./intentMerge.service.js";

/**
 * Combine user + query vectors
 */
function combineVectors(userVector, queryVector, alpha) {
    if (!userVector) return queryVector;

    return userVector.map(
        (x, i) => alpha * x + (1 - alpha) * queryVector[i]
    );
}

/**
 * Core recommendation execution (NO session logic here)
 */
async function recommendWithIntent(userId, intent, query) {
    if (!query || typeof query !== "string" || !query.trim()) {
        throw new Error("Cannot generate recommendations without a valid query");
    }

    // 1️⃣ Build query embedding
    const queryVector = await generateEmbedding(query);

    // 2️⃣ Load user vector safely (Qdrant requires numeric ID)
    let userVector = null;
    const numericUserId = Number(userId);

    if (Number.isInteger(numericUserId) && numericUserId > 0) {
        try {
            const points = await qdrant.retrieve("users", {
                ids: [numericUserId],
            });
            userVector = points.length ? points[0].vector : null;
        } catch {
            userVector = null; // cold-start user
        }
    }

    // 3️⃣ Combine vectors
    const alpha = computeDynamicAlpha(userVector, queryVector);
    const finalVector = combineVectors(userVector, queryVector, alpha);

    // 4️⃣ Candidate generation
    const results = await qdrant.search("cars", {
        vector: finalVector,
        limit: 20,
    });

    let cars = results.map(r => ({
        ...r.payload,
        score: r.score,
    }));

    // 🔒 HARD INCLUDE
    if (intent.hard_constraints?.include?.length) {
        const requiredTypes = intent.hard_constraints.include.map(e => e.value);
        cars = cars.filter(c => requiredTypes.includes(c.type));
    }

    // ❌ HARD EXCLUDE
    if (intent.hard_constraints?.exclude?.length) {
        const excludedTypes = intent.hard_constraints.exclude.map(e => e.value);
        cars = cars.filter(c => !excludedTypes.includes(c.type));
    }

    // ⭐ SOFT PREFERENCES
    if (intent.soft_preferences?.familyFriendly) {
        cars = cars.map(c => ({
            ...c,
            score: c.score + 0.05,
        }));
    }

    if (intent.soft_preferences?.type) {
        cars = cars.map(c => ({
            ...c,
            score:
                c.type === intent.soft_preferences.type
                    ? c.score + 0.1
                    : c.score,
        }));
    }

    // 🎯 OBJECTIVES
    const priceObjective = intent.objectives?.find(o => o.field === "price");

    if (priceObjective?.direction === "asc") {
        cars.sort((a, b) => a.price - b.price);
    }

    if (priceObjective?.direction === "desc") {
        cars.sort((a, b) => b.price - a.price);
    }

    await UserEvent.create({
        userId,
        eventType: "search",
        query,
        weight: EVENT_WEIGHTS.search,
    });

    // 🧠 EXPLANATION
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

/**
 * MAIN ENTRY — session-aware recommendation
 */
export async function recommendCarsForUser(
    userId,
    query,
    sessionId,
    clarificationAnswer = null
) {
    // 1️⃣ Check existing pending session
    const existingSession = sessionId
        ? await getActiveSession(userId, sessionId)
        : null;

    // 🚫 Invalid clarification reply (no session)
    if (clarificationAnswer && !existingSession) {
        return {
            error:
                "No active session found for clarification. Please start a new query.",
        };
    }

    // 2️⃣ Clarification reply path
    if (existingSession && clarificationAnswer) {
        const mergedIntent = await mergeIntent(
            existingSession.intentJson,
            clarificationAnswer
        );

        await resolveSession(existingSession, mergedIntent);

        const originalQuery = existingSession.originalQuery;

        if (!originalQuery) {
            return {
                error:
                    "Session is corrupted (missing original query). Please start again.",
            };
        }

        return recommendWithIntent(userId, mergedIntent, originalQuery);
    }

    // 🚫 Fresh request must have a query
    if (!query) {
        return {
            error: "Query is required to get recommendations.",
        };
    }

    // 3️⃣ Fresh query → interpret intent
    const interpretation = await interpretQuery(query);

    // 4️⃣ Needs clarification → save session
    if (interpretation.needsClarification) {
        if (sessionId) {
            await saveSession(
                userId,
                sessionId,
                interpretation.intent,
                query
            );
        }

        return await buildVehicleTypeClarification();
    }

    // 5️⃣ Intent is confident → recommend
    return recommendWithIntent(userId, interpretation.intent, query);
}
