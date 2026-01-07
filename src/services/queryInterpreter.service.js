import openai from "../config/openai.js";
import { getAllowedCarTypes } from "./domain.service.js";

function sanitizeIntent(intent, allowedTypes) {
    // Hard constraints
    if (intent?.hard_constraints?.exclude?.length) {
        intent.hard_constraints.exclude =
            intent.hard_constraints.exclude.filter(
                e => allowedTypes.includes(e.value)
            );
    }

    // Soft preferences
    if (
        intent?.soft_preferences?.type &&
        !allowedTypes.includes(intent.soft_preferences.type)
    ) {
        intent.soft_preferences.type = null;
    }

    // Objectives (still fixed — business logic)
    intent.objectives = (intent.objectives || []).filter(
        o =>
            ["price"].includes(o.field) &&
            ["asc", "desc"].includes(o.direction)
    );

    return intent;
}

export async function interpretQuery(query) {
    const systemPrompt = `
You convert car search queries into structured intent.
Only output JSON.
Use values that exist in the domain.
If unsure, use null or empty arrays.
`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
        ],
    });

    let rawIntent;
    try {
        rawIntent = JSON.parse(response.choices[0].message.content);
    } catch {
        return {
            hard_constraints: { exclude: [] },
            soft_preferences: { type: null },
            objectives: [],
        };
    }

    const allowedTypes = await getAllowedCarTypes();
    return sanitizeIntent(rawIntent, allowedTypes);
}
