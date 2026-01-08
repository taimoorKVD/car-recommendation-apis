import {Router} from "express";
import {recommendCarsForUser} from "../services/recommendation.service.js";

const router = Router();

router.get("/recommend/:userId", async (req, res) => {
    try {
        // 🔒 Normalize inputs at the boundary
        const userId = Number(req.params.userId);
        const query = typeof req.query.query === "string" ? req.query.query : null;
        const sessionId =
            typeof req.query.sessionId === "string"
                ? req.query.sessionId
                : null;
        const answer =
            typeof req.query.answer === "string" ? req.query.answer : null;

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                error: "Invalid userId",
            });
        }

        if (!query && !answer) {
            return res.status(400).json({
                error:
                    "Either 'query' or clarification 'answer' must be provided.",
            });
        }

        // 🧠 Delegate everything to recommendation service
        const result = await recommendCarsForUser(
            userId,
            query,
            sessionId,
            answer
        );

        return res.json(result);
    } catch (err) {
        console.error("cars.routes error:", err);
        return res.status(500).json({
            error: "Internal server error",
            details: err.message,
        });
    }
});

export default router;
