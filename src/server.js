import "dotenv/config";
import express from "express";
import sequelize from "./config/db.js";
import carRoutes from "./routes/cars.routes.js";
import {setupCollections} from "./services/qdrant.setup.js";

const app = express();
app.use(express.json());

app.use("/cars", carRoutes);

const PORT = process.env.PORT || 4000;

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log("✅ MySQL connected");

        await setupCollections();

        app.listen(PORT, () =>
            console.log(`🚀 Server running at http://localhost:${PORT}`)
        );
    } catch (err) {
        console.error("❌ Startup error:", err);
    }
})();
