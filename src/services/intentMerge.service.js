import { getAllowedCarTypes } from "./domain.service.js";

/**
 * Merge clarification answer into existing intent
 */
export async function mergeIntent(existingIntent, answer) {
    const intent = JSON.parse(JSON.stringify(existingIntent));
    const normalizedAnswer = answer.toLowerCase().trim();

    const allowedTypes = await getAllowedCarTypes();

    // Remove any previous vehicle type constraints
    intent.hard_constraints.include = intent.hard_constraints.include || [];
    intent.hard_constraints.exclude = intent.hard_constraints.exclude || [];

    intent.hard_constraints.include = intent.hard_constraints.include.filter(
        c => c.field !== "type"
    );

    intent.soft_preferences = intent.soft_preferences || {};
    delete intent.soft_preferences.type;

    // Handle "any type"
    if (normalizedAnswer === "any type") {
        return intent;
    }

    // Handle "<type> only"
    for (const type of allowedTypes) {
        if (normalizedAnswer === `${type.toLowerCase()} only`) {
            intent.hard_constraints.include.push({
                field: "type",
                value: type,
            });
            return intent;
        }
    }

    // Fallback: no change
    return intent;
}
