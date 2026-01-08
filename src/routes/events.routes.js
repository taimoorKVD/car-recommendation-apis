import { Router } from "express";
import UserEvent from "../models/UserEvent.js";
import { EVENT_WEIGHTS } from "../config/eventWeights.js";
import { updateUserEmbedding } from "../services/userEmbedding.service.js";

const router = Router();

/**
 * POST /events
 *
 * Body:
 * {
 *   userId: number,
 *   eventType: "search" | "click" | "booking",
 *   query?: string,
 *   carId?: number
 * }
 */
router.post("/", async (req, res) => {
    try {
        const { userId, eventType, query, carId } = req.body;

        // 🔒 Basic validation
        const numericUserId = Number(userId);

        if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        if (!EVENT_WEIGHTS[eventType]) {
            return res.status(400).json({
                error: "Invalid eventType. Allowed: search, click, booking",
            });
        }

        // 📝 Create event record
        const event = await UserEvent.create({
            userId: numericUserId,
            eventType,
            query: query || null,
            carId: carId || null,
            weight: EVENT_WEIGHTS[eventType],
        });

        // 🧠 Learn from event (if text available)
        if (query) {
            await updateUserEmbedding(
                numericUserId,
                query,
                EVENT_WEIGHTS[eventType]
            );
        }

        return res.json({
            success: true,
            event,
        });
    } catch (err) {
        console.error("events.routes error:", err);

        return res.status(500).json({
            error: "Internal server error",
            details: err.message,
        });
    }
});

export default router;
