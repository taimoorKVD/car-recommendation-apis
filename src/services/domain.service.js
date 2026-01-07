import Car from "../models/Car.js";

let cachedTypes = null;

export async function getAllowedCarTypes() {
    if (cachedTypes) return cachedTypes;

    const rows = await Car.findAll({
        attributes: ["type"],
        group: ["type"],
    });

    cachedTypes = rows.map(r => r.type);
    return cachedTypes;
}