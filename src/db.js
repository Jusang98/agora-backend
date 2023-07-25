import mysql from "mysql2";
import dotenv from "dotenv";
import { sequelize } from "./models";

dotenv.config();

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("MySQL 연결...!");
  })
  .catch((err) => {
    console.error(err);
  });
