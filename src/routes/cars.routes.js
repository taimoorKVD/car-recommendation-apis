import { Router } from "express";
import { recommendCarsForUser } from "../services/recommendation.service.js";

const router = Router();

router.get("/recommend/:userId", async (req, res) => {
    const { userId } = req.params;
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            error: "query parameter is required, e.g. ?query=family SUV",
        });
    }

    const cars = await recommendCarsForUser(Number(userId), query);
    res.json(cars);
});

export default router;