import "dotenv/config";

import sequelize from "../../config/db.js";
import Car from "../../models/Car.js";
import { indexCar } from "../../services/event.service.js";
import { setupCollections } from "../../services/qdrant.setup.js";

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });

        await setupCollections(); // 👈 IMPORTANT

        const cars = [
            {
                brand: "Toyota",
                model: "Fortuner",
                type: "SUV",
                price: 35000,
                description: "Powerful family SUV for long trips",
            },
            {
                brand: "Tesla",
                model: "Model 3",
                type: "Sedan",
                price: 42000,
                description: "Electric car with autopilot and long range",
            },
            {
                brand: "Hyundai",
                model: "Creta",
                type: "SUV",
                price: 22000,
                description: "Fuel efficient compact SUV",
            },
        ];

        for (const car of cars) {
            const savedCar = await Car.create(car);
            await indexCar(savedCar);
        }

        console.log("✅ Cars seeded and indexed");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeder failed:", err);
        process.exit(1);
    }
})();
