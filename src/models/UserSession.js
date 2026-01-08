import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserSession = sequelize.define("UserSession", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    sessionId: { type: DataTypes.STRING, allowNull: false },
    intentJson: { type: DataTypes.JSON, allowNull: false },
    status: {
        type: DataTypes.ENUM("pending", "resolved"),
        defaultValue: "pending",
    },
    originalQuery: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'user_sessions',
    freezeTableName: true,
});

export default UserSession;
