import express from "express";
import {
  getBoardList,
  deleteBoard,
  registerBoard,
  registerVideo,
  getBoard,
} from "../controllers/boardController";
import { multerMiddleware } from "../middlewares";

const boardRouter = express.Router();

boardRouter.route("/:userId([0-9a-f]{24})/boardlist").get(getBoardList);
boardRouter.route("/:boardId([0-9a-f]{24})").get(getBoard).post(deleteBoard);
boardRouter.route("/").post(multerMiddleware, registerBoard);
boardRouter.route("/video").post(multerMiddleware, registerVideo);

// boardRouter.route("/:id([0-9a-f]{24})/edit").put(editBoard);

export default boardRouter;
