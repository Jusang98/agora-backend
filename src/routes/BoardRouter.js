// boardRouter.js

import express from 'express';
import {
  watch,
  getBoard,
  postBoardCreate,
  deleteBoard,
} from '../controllers/boardController';
import { multerMiddlewareBoard } from '../middlewares';

const boardRouter = express.Router();

boardRouter
  .route('/upload')
  .get(getBoard)
  .post(multerMiddlewareBoard, postBoardCreate);

export default boardRouter;
