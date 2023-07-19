import express from "express";
import { home } from "../Controllers/userController";

const rootRouter = express.Router();

rootRouter.route("/").get(home);

export default rootRouter;
