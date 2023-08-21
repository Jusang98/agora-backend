import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import userRouter from "./routes/userRoute";
import boardRouter from "./routes/boardRouter";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerSpec = YAML.load(path.join(__dirname, "../build/swagger.yaml"));
const app = express();
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/user", userRouter);
app.use("/board", boardRouter);

export default app;
