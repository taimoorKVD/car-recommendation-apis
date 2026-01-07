export function cosineSimilarity(v1, v2) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < v1.length; i++) {
        dot += v1[i] * v2[i];
        normA += v1[i] * v1[i];
        normB += v2[i] * v2[i];
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}