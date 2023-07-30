// boardRouter.js

import express from 'express';
import {
  watch,
  getBoard,
  postBoardCreate,
  deleteBoard,
} from '../controllers/boardController';
import { multerMiddleware } from '../middlewares';

const boardRouter = express.Router();
boardRouter.route('/:id([0-9a-f]{24})').get(watch);
boardRouter
  .route('/upload')
  .get(getBoard)
  .post(multerMiddleware, postBoardCreate);

export default boardRouter;
