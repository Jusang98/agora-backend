const Sequelize = require("sequelize");

module.exports = class Map extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        map_uid: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        user_uid: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          references: {
            model: "users",
            key: "id",
          },
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Map",
        tableName: "maps",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    this.belongsTo(db.User, {
      foreignKey: "user_uid",
      targetKey: "user_uid",
    });
  }
};
