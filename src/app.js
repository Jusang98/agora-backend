import express from "express";
import morgan from "morgan";
import cors from "cors";
import userRouter from "./routes/userRoute";
import boardRouter from "./routes/boardRouter";

const app = express();

app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/user", userRouter);
app.use("/boards", boardRouter);

export default app;
