const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const User = require('../models/User');
const config = require('../config/config.json')[env]; //config.json 불러오기
const db = {}; // 실제 데이터베이스가 이 db 객체와 연결됨

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
// 데이터베이스와 연결하기, 시퀄라이즈 ORM 객체 생성

db.sequelize = sequelize; // 나중에 연결 객체 재사용을 위해 넣어둠, db객체에 sequelize라는 프로퍼티 추가
db.User = User;

User.init(sequelize);
User.associate(db);

module.exports = db; // export 하기
