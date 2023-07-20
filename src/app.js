import express from "express";
import morgan from "morgan";
import cors from "cors";
import rootRouter from "./routes/rootRoute";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

const corsConfig = {
  origin: ["http://localhost:3000", "http://52.78.96.229:5000"],
};

app.use(cors(corsConfig));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  next();
});

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", rootRouter);

export default app;
