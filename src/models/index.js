const Sequelize = require("sequelize");
const User = require("./User");
const GuestBoard = require("./GuestBoard");
const Map = require("./Map");
const env = "development";

const config = require(__dirname + "/../config/config.json")[env];

const db = new Set();

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.User = User;
db.GuestBoard = GuestBoard;
db.Map = Map;

User.init(sequelize);
GuestBoard.init(sequelize);
Map.init(sequelize);

User.associate(db);
GuestBoard.associate(db);
Map.associate(db);

module.exports = db;
