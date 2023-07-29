import express from "express";
import {
  home,
  getSearchUser,
  getLogin,
  postLogin,
  getUserRegister,
  postUserRegister,
} from "../controllers/userController";

const rootRouter = express.Router();

rootRouter.route("/").get(home);
rootRouter.route("/search").get(getSearchUser);
rootRouter.route("/login").get(getLogin).post(postLogin);
rootRouter.route("/user-register").get(getUserRegister).post(postUserRegister);

export default rootRouter;
