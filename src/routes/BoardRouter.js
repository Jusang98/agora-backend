import express from 'express';
import {
  watch,
  getBoard,
  postBoardUpload,
  deleteBoard,
} from '../controllers/boardController';
import { multerMiddlewareBoard } from '../middlewares';

const boardRouter = express.Router();

boardRouter
  .route('/upload')
  .get(getBoard)
  .post(multerMiddlewareBoard, postBoardUpload);

export default boardRouter;
