import express from 'express';
import {
  home,
  getLogin,
  postLogin,
  getUserRegister,
  postUserRegister,
} from '../controllers/userController';
import { auth } from '../middlewares';

const rootRouter = express.Router();

rootRouter.route('/').get(home);
rootRouter.route('/login').get(getLogin).post(postLogin);

rootRouter.route('/user-register').get(getUserRegister).post(postUserRegister);

export default rootRouter;
