import "dotenv/config";

import sequelize from "../../config/db.js";
import Car from "../../models/Car.js";
import { indexCar } from "../../services/event.service.js";
import { setupCollections } from "../../services/qdrant.setup.js";

(async () => {
    try {
        // 1️⃣ Connect to database
        await sequelize.authenticate();
        console.log("✅ Database connected");

        // ⚠️ Never force sync in indexing scripts
        await sequelize.sync();

        // 2️⃣ Ensure Qdrant collections exist
        await setupCollections();

        // 3️⃣ Fetch cars dynamically from DB
        const cars = await Car.findAll();

        if (!cars.length) {
            console.log("⚠️ No cars found in database. Nothing to index.");
            process.exit(0);
        }

        console.log(`🚗 Indexing ${cars.length} cars...`);

        // 4️⃣ Index cars (NO re-creation)
        for (const car of cars) {
            await indexCar(car);
        }

        console.log("✅ Cars indexed successfully");
        process.exit(0);

    } catch (err) {
        console.error("❌ Cars indexing failed:", err);
        process.exit(1);
    }
})();
