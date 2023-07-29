import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routes/rootRoute";
import userRouter from "./routes/userRoute";
import videoRouter from "./routes/videoRoute";
import imageRouter from "./routes/imageRouter";
import { corsMiddleware, localsMiddleware } from "./middlewares";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 8.64e7,
    },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
  })
);

app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/", rootRouter);
app.use("/user", userRouter);
app.use("/videos", videoRouter);
app.use("/images", imageRouter);

export default app;
