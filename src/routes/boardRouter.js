import express from "express";
import {
  getBoard,
  deleteBoard,
  registerBoard,
} from "../controllers/boardController";
import { multerMiddleware } from "../middlewares";

const boardRouter = express.Router();

boardRouter.route("/:id([0-9a-f]{24})").get(getBoard).post(deleteBoard);
boardRouter.route("/upload").post(multerMiddleware, registerBoard);
// boardRouter.route("/:id([0-9a-f]{24})/edit").put(editBoard);

export default boardRouter;
