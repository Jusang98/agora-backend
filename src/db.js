import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

db.on("error", (error) => console.log("DB Error", error)); // 여러번 실행 가능
db.once("open", () => console.log("몽고 DB 연결...!"));
