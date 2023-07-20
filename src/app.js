import express from "express";
import morgan from "morgan";
import rootRouter from "./routes/rootRoute";
import { corsMiddleware } from "./middlewares";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(corsMiddleware);

app.use("/", rootRouter);

export default app;
