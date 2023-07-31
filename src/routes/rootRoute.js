import express from "express";
import {
  verifyUserCode,
  postUserRegister,
  postLogin,
  getSearchUser,
} from "../controllers/userController";

const rootRouter = express.Router();

rootRouter.get("/", (req, res) => {
  return res.send("회원가입!!!!");
});
rootRouter.route("/verify").post(verifyUserCode);
rootRouter.route("/user-register").post(postUserRegister);
rootRouter.route("/login").post(postLogin);
rootRouter.route("/search").get(getSearchUser);

export default rootRouter;
