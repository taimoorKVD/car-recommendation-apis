import qdrant from "../config/qdrant.js";

export async function setupCollections() {
    const existing = await qdrant.getCollections();
    const names = existing.collections.map(c => c.name);

    if (!names.includes("cars")) {
        await qdrant.createCollection("cars", {
            vectors: {
                size: 1536,
                distance: "Cosine",
            },
        });
        console.log("✅ Qdrant collection 'cars' created");
    }

    if (!names.includes("users")) {
        await qdrant.createCollection("users", {
            vectors: {
                size: 1536,
                distance: "Cosine",
            },
        });
        console.log("✅ Qdrant collection 'users' created");
    }
}
