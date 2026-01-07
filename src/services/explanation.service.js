export function explainCar({ car, intent, allCars }) {
    const reasons = [];

    if (intent?.hard_constraints?.exclude?.length) {
        const excludedTypes = intent.hard_constraints.exclude.map(e => e.value);

        if (!excludedTypes.includes(car.type)) {
            reasons.push(
                `it satisfies your request to exclude ${excludedTypes.join(", ")}`
            );
        }
    }

    // 2️⃣ Soft preference explanation
    if (
        intent?.soft_preferences?.type &&
        car.type === intent.soft_preferences.type
    ) {
        reasons.push(
            `it matches your preference for ${car.type.toLowerCase()} cars`
        );
    }

    // 3️⃣ Objective explanation (price — RELATIVE, not absolute)
    const priceObjective = intent?.objectives?.find(
        o => o.field === "price"
    );

    if (priceObjective?.direction === "asc") {
        const prices = allCars.map(c => c.price);
        const minPrice = Math.min(...prices);

        if (car.price === minPrice) {
            reasons.push("it is the cheapest available option");
        } else if (car.price <= minPrice * 1.2) {
            reasons.push("it is among the more affordable options");
        }
    }

    if (priceObjective?.direction === "desc") {
        const prices = allCars.map(c => c.price);
        const maxPrice = Math.max(...prices);

        if (car.price === maxPrice) {
            reasons.push("it is among the most premium options");
        }
    }

    // 4️⃣ Fallback (should rarely happen)
    if (!reasons.length) {
        reasons.push("it best matches your current request");
    }

    return `Recommended because ${reasons.join(" and ")}.`;
}
