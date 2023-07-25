const Sequelize = require("sequelize");

module.exports = class GuestBoard extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        guestboard_uid: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        guestboard_title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        guestboard_content: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        guestboard_date: {
          type: Sequelize.DATE,
          allowNull: false,
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
        modelName: "GuestBoard",
        tableName: "guestboards",
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
