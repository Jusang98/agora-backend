import express from "express";
import {
  home,
  getSearchUser,
  getLogin,
  postLogin,
  getUserRegister,
  postUserRegister,
  verifyUserEmail,
  logout,
} from "../controllers/userController";
import { publicOnlyMiddleware, protectorMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.route("/").get(home);
rootRouter.route("/search").get(getSearchUser);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
rootRouter.route("/logout").get(protectorMiddleware, logout);
rootRouter
  .route("/user-register")
  .all(publicOnlyMiddleware)
  .get(getUserRegister)
  .post(postUserRegister);
rootRouter.route("/verify/:token").get(verifyUserEmail);

export default rootRouter;
