import { Sequelize, DataTypes, FLOAT } from "sequelize";

const sequelize = new Sequelize("Agora", "sunghwan", "1q2w3e4r!", {
  host: "agora-backend-mysql.cjjhfjmd1bce.ap-northeast-2.rds.amazonaws.com",
  dialect: "mysql",
});

const User = sequelize.define("User", {
  user_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_pwd: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_nickname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_character_num: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

(async () => {
  try {
    //어떤 파일에서도 시퀄라이져를 이용할수 있도록 시퀄라이즈를 초기화하고 모델들을 import할 수 있도록함.
    await sequelize.authenticate();
    console.log("MySQL 동기화 성공...!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

export default User;
