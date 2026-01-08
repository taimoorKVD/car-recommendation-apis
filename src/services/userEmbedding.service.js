import qdrant from "../config/qdrant.js";
import { generateEmbedding } from "./embedding.service.js";

const DECAY = 0.95;

/**
 * Update user embedding with time decay + weighted event signal
 *
 * Formula:
 * new_vector = decay(old_vector) + weight * event_embedding
 */
export async function updateUserEmbedding(userId, text, weight) {
    if (!text || typeof text !== "string" || !text.trim()) {
        return; // nothing to learn from
    }

    const embedding = await generateEmbedding(text);
    const numericUserId = Number(userId);

    let existingVector = null;

    // 🔍 Load existing user vector if present
    try {
        const points = await qdrant.retrieve("users", {
            ids: [numericUserId],
        });
        existingVector = points.length ? points[0].vector : null;
    } catch {
        existingVector = null; // cold start
    }

    // ⏳ Apply time decay
    const decayedVector = existingVector
        ? existingVector.map(v => v * DECAY)
        : null;

    // ➕ Add new weighted signal
    const newVector = decayedVector
        ? decayedVector.map((v, i) => v + weight * embedding[i])
        : embedding.map(v => weight * v);

    // 📤 Upsert back into Qdrant
    await qdrant.upsert("users", {
        points: [
            {
                id: numericUserId,
                vector: newVector,
            },
        ],
    });
}