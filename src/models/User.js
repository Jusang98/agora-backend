const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        user_uid: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        user_email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        user_pwd: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        user_nickname: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        user_character_num: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {}
};
