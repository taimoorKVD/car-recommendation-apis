import UserEvent from "../models/UserEvent.js";
import {upsertUserVector} from "./userVector.service.js";

export async function logSearchEvent(userId, query) {
    if (!userId || !query) return;

    await UserEvent.create({
        userId,
        eventType: "search",
        query,
    });

    await upsertUserVector(userId);
}
