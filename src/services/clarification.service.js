import { getAllowedCarTypes } from "./domain.service.js";

/**
 * Build clarification response for missing vehicle type
 */
export async function buildVehicleTypeClarification() {
    const types = await getAllowedCarTypes();

    return {
        clarification: true,
        dimension: "vehicleType",
        question: "Which vehicle type are you looking for?",
        options: [
            ...types.map(type => `${type} only`),
            "Any type",
        ],
    };
}
