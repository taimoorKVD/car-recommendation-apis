const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
    name: DataTypes.STRING,
});

module.exports = User;
