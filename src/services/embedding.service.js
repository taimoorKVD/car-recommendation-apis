import openai from "../config/openai.js";

export async function generateEmbedding(text) {
    if (!text) {
        throw new Error("generateEmbedding called with empty input");
    }

    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });

    return response.data[0].embedding;
}