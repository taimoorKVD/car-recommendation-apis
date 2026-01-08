import IntentRule from "../models/IntentRule.js";

let cache = null;

export async function getIntentRules() {
    if (cache) return cache;

    const rules = await IntentRule.findAll();
    cache = rules.reduce((acc, r) => {
        acc[r.ruleKey] = {
            action: r.action,
            threshold: r.confidenceThreshold,
        };
        return acc;
    }, {});

    return cache;
}