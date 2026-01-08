import UserSession from "../models/UserSession.js";

function normalizeUserId(userId) {
    const n = Number(userId);
    return Number.isInteger(n) && n > 0 ? n : null;
}

function normalizeSessionId(sessionId) {
    if (sessionId === null || sessionId === undefined) return null;
    const s = String(sessionId).trim();
    return s.length ? s : null;
}

export async function getActiveSession(userId, sessionId) {
    const uid = normalizeUserId(userId);
    const sid = normalizeSessionId(sessionId);

    if (!uid || !sid) return null;

    return UserSession.findOne({
        where: {userId: uid, sessionId: sid, status: "pending"},
    });
}

export async function saveSession(userId, sessionId, intent, originalQuery) {
    return UserSession.create({
        userId,
        sessionId,
        intentJson: intent,
        originalQuery,
        status: "pending",
    });
}

export async function resolveSession(session, mergedIntent) {
    if (!session) return null;
    if (!mergedIntent) return null;

    session.intentJson = mergedIntent;
    session.status = "resolved";
    await session.save();
    return mergedIntent;
}
