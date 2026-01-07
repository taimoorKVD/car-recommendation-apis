import {cosineSimilarity} from "../utils/vectorMath.js";

export function computeDynamicAlpha(userVector, queryVector) {
    // No user history → pure query
    if (!userVector) return 0;

    const similarity = cosineSimilarity(userVector, queryVector);

    /**
     * similarity ≈ 1   → same intent → trust user
     * similarity ≈ 0   → new intent → trust query
     */

        // Clamp similarity to [0,1]
    const sim = Math.max(0, Math.min(1, similarity));

    // Map similarity to alpha range
    // alpha ∈ [0.3, 0.8]
    return 0.3 + sim * 0.5;
}
