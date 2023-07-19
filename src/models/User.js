import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("Agora", "sunghwan", "1q2w3e4r!", {
  host: "agora.cjjhfjmd1bce.ap-northeast-2.rds.amazonaws.com",
  dialect: "mysql",
});

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
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
