import mongoose from "mongoose";
import { createClient } from "redis";
import User from "./models/User";

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;
export const client = createClient({
  host: process.env.HOST_URL,
  port: process.env.REDIS_PORT,
});
client.connect();

db.on("error", (error) => console.log("DB Error", error)); // 여러번 실행 가능
db.once("open", () => console.log("몽고 DB 연결...!"));

client.on("error", (error) => console.log("Redis Error", error));
client.once("connect", () => console.log("Redis 연결...!"));

const getAllUsers = async () => {
  const users = await User.find({});
  for (let i = users.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }
  client.sAdd("users", JSON.stringify(users));
  return users;
};

getAllUsers().then((users) => {
  console.log("Users are shuffled and stored in Redis.");
});
