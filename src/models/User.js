const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        user_uid: {
          type: Sequelize.STRING,
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
        modelName: 'User',
        tableName: 'users',
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {}
};
// const sequelize = new Sequelize(
//   process.env.RES_DATABASE,
//   process.env.RDS_USER,
//   process.env.RDS_PASSWORD,
//   {
//     host: process.env.RDS_HOST,
//     dialect: 'mysql',
//   }
// );

// const User = sequelize.define(
//   'users',
//   {
//     user_uid: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     user_email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     user_pwd: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     user_nickname: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     user_character_num: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     timestamps: false,
//     underscored: false,
//     modelName: 'User',
//     tableName: 'users',
//     paranoid: false,
//     charset: 'utf8',
//     collate: 'utf8_general_ci',
//   }
// );

// (async () => {
//   try {
//     //어떤 파일에서도 시퀄라이져를 이용할수 있도록 시퀄라이즈를 초기화하고 모델들을 import할 수 있도록함.
//     await sequelize.authenticate();
//     console.log('MySQL 동기화 성공...!');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// })();

// export default User;
