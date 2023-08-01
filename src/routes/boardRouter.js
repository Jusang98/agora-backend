import express from 'express';
import {
  getUserBoards,
  deleteBoard,
  registerBoard,
  registerVideo,
} from '../controllers/boardController';
import { multerMiddleware } from '../middlewares';

const boardRouter = express.Router();

boardRouter.route('/:id([0-9a-f]{24})').get(getUserBoards).post(deleteBoard);
boardRouter.route('/upload').post(multerMiddleware, registerBoard);
boardRouter.route('/video').post(multerMiddleware, registerVideo);
// boardRouter.route("/:id([0-9a-f]{24})/edit").put(editBoard);

export default boardRouter;
