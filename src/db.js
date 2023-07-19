import mysql2 from "mysql2";

const dbConfig = {
  host: "agora.cjjhfjmd1bce.ap-northeast-2.rds.amazonaws.com",
  user: "sunghwan",
  password: "1q2w3e4r!",
  database: "Agora",
};

const connection = mysql2.createConnection(dbConfig);

connection.connect((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("MySQL 연결 성공!");
});
