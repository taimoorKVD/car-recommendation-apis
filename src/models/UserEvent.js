import {DataTypes} from "sequelize";
import sequelize from "../config/db.js";

const UserEvent = sequelize.define("UserEvent", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    carId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    eventType: {
        type: DataTypes.ENUM("search", "click", "book"),
        allowNull: false,
    },
    query: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "user_events",
    freezeTableName: true,
});

export default UserEvent;
