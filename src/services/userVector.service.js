import qdrant from "../config/qdrant.js";
import { buildUserEmbedding } from "./userEmbedding.service.js";

export async function upsertUserVector(userId) {
    const vector = await buildUserEmbedding(userId);
    if (!vector) return;

    await qdrant.upsert("users", {
        wait: true,
        points: [
            {
                id: userId,
                vector,
            },
        ],
    });
}
