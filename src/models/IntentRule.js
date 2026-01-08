import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const IntentRule = sequelize.define("IntentRule", {
    ruleKey: { type: DataTypes.STRING, unique: true },
    action: DataTypes.STRING,
    confidenceThreshold: DataTypes.FLOAT,
}, {
    tableName: "intent_rules",
    freezeTableName: true,
});

export default IntentRule;
