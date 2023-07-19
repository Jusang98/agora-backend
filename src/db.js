import mysql from "mysql";
require("dotenv").config();

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RES_DATABASE,
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("MySQL 연결 성공!");
});
