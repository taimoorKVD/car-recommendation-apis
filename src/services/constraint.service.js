export function extractConstraints(query) {
    const q = query.toLowerCase();

    const constraints = {
        excludeTypes: [],
        sortBy: null,
    };

    // ❌ Hard exclusions
    if (q.includes("suv not allowed") || q.includes("no suv")) {
        constraints.excludeTypes.push("SUV");
    }

    if (q.includes("sedan not allowed") || q.includes("no sedan")) {
        constraints.excludeTypes.push("Sedan");
    }

    // 🎯 Optimization objectives
    if (q.includes("cheap") || q.includes("cheapest") || q.includes("most cheap")) {
        constraints.sortBy = "price_asc";
    }

    if (q.includes("expensive") || q.includes("luxury")) {
        constraints.sortBy = "price_desc";
    }

    return constraints;
}
