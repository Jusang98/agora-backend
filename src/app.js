import express from "express";
import morgan from "morgan";
import cors from "cors";
import rootRouter from "./routes/rootRoute";
import userRouter from "./routes/userRoute";
import boardRouter from "./routes/boardRouter";
import apiRouter from "./routes/apiRoute";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(corsMiddleware);
app.use(cors());

app.use("/uploads", express.static("uploads"));

app.use("/", rootRouter);
app.use("/user", userRouter);
app.use("/boards", boardRouter);
app.use("/api", apiRouter);

export default app;
