import express from "express";
import morgan from "morgan";
import rootRouter from "./Routes/rootRouter";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/", rootRouter);

export default app;
