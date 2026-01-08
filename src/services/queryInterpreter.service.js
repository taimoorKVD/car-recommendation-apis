import openai from "../config/openai.js";
import { getAllowedCarTypes } from "./domain.service.js";
import { getIntentRules } from "./intentRules.service.js";

/**
 * Normalize rules from DB with safe defaults
 */
function normalizeRules(rulesFromDb = {}) {
    return {
        vehicle_type_explicit: rulesFromDb.vehicle_type_explicit || {
            action: "hard_include",
            threshold: 0.8,
        },
        vehicle_type_negation: rulesFromDb.vehicle_type_negation || {
            action: "hard_exclude",
            threshold: 0.9,
        },
        vehicle_type_weak: rulesFromDb.vehicle_type_weak || {
            action: "soft_preference",
            threshold: 0.4,
        },
    };
}

/**
 * Build dynamic system prompt
 */
function buildSystemPrompt(allowedTypes, rules) {
    return `
You convert car search queries into structured intent.

ALLOWED VEHICLE TYPES:
${allowedTypes.join(", ")}

INTERPRETATION POLICY:
- Explicit vehicle type mention → ${rules.vehicle_type_explicit.action}
- Explicit vehicle type negation → ${rules.vehicle_type_negation.action}
- Weak or optional mention → ${rules.vehicle_type_weak.action}

IMPORTANT:
- Use ONLY allowed vehicle types
- NEVER invent values
- NEVER merge multiple types into one value
- If unsure, return null with low confidence
- Output ONLY valid JSON

Return JSON in this schema:

{
  "vehicleType": {
    "value": "<allowed type|null>",
    "confidence": 0.0
  },
  "negatedTypes": [
    { "value": "<allowed type>", "confidence": 0.0 }
  ],
  "soft_preferences": {
    "familyFriendly": true|false|null,
    "mileage": "good|average|null"
  },
  "objectives": [
    { "field": "price", "direction": "asc|desc" }
  ]
}
`;
}

/**
 * Apply confidence rules + required-dimension logic
 */
function applyRules(parsed, allowedTypes, rules) {
    const intent = {
        hard_constraints: { include: [], exclude: [] },
        soft_preferences: {},
        objectives: parsed.objectives || [],
    };

    let needsClarification = false;

    // ---------- VEHICLE TYPE (INCLUDE) ----------
    if (
        parsed.vehicleType?.value &&
        allowedTypes.includes(parsed.vehicleType.value)
    ) {
        const confidence = parsed.vehicleType.confidence ?? 0;

        if (confidence >= rules.vehicle_type_explicit.threshold) {
            intent.hard_constraints.include.push({
                field: "type",
                value: parsed.vehicleType.value,
            });
        } else if (confidence >= rules.vehicle_type_weak.threshold) {
            intent.soft_preferences.type = parsed.vehicleType.value;
        } else {
            needsClarification = true;
        }
    }

    // ---------- VEHICLE TYPE (EXCLUDE) ----------
    for (const neg of parsed.negatedTypes || []) {
        if (!allowedTypes.includes(neg.value)) continue;

        if ((neg.confidence ?? 0) >= rules.vehicle_type_negation.threshold) {
            intent.hard_constraints.exclude.push({
                field: "type",
                value: neg.value,
            });
        }
    }

    // ---------- SOFT PREFERENCES ----------
    if (parsed.soft_preferences?.familyFriendly !== undefined) {
        intent.soft_preferences.familyFriendly =
            parsed.soft_preferences.familyFriendly;
    }

    if (parsed.soft_preferences?.mileage) {
        intent.soft_preferences.mileage = parsed.soft_preferences.mileage;
    }

    // ---------- OBJECTIVES (SANITIZED) ----------
    intent.objectives = intent.objectives.filter(
        o =>
            ["price"].includes(o.field) &&
            ["asc", "desc"].includes(o.direction)
    );

    // ---------- REQUIRED DIMENSION RULE (KEY FIX) ----------
    const hasVehicleConstraint =
        intent.hard_constraints.include.length > 0 ||
        Boolean(intent.soft_preferences.type);

    if (!hasVehicleConstraint && allowedTypes.length > 1) {
        needsClarification = true;
    }

    return { intent, needsClarification };
}

/**
 * Main entry
 */
export async function interpretQuery(query) {
    const allowedTypes = await getAllowedCarTypes();
    const rules = normalizeRules(await getIntentRules());

    const systemPrompt = buildSystemPrompt(allowedTypes, rules);

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
        ],
    });

    let parsed;
    try {
        parsed = JSON.parse(response.choices[0].message.content);
    } catch {
        return {
            intent: null,
            needsClarification: true,
            reason: "Unable to understand the request clearly.",
        };
    }

    return applyRules(parsed, allowedTypes, rules);
}
