import qdrant from "../config/qdrant.js";
import { generateEmbedding } from "./embedding.service.js";

export async function indexCar(car) {
    const vector = await generateEmbedding(
        `${car.brand} ${car.model} ${car.type} ${car.description}`
    );

    await qdrant.upsert("cars", {
        wait: true,
        points: [
            {
                id: car.id,
                vector,
                payload: {
                    brand: car.brand,
                    model: car.model,
                    type: car.type,
                    price: car.price,
                },
            },
        ],
    });
}
