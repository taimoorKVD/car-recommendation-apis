import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Car = sequelize.define("Car", {
    brand: DataTypes.STRING,
    model: DataTypes.STRING,
    type: DataTypes.STRING,
    price: DataTypes.INTEGER,
    description: DataTypes.TEXT,
});

export default Car;
