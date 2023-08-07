import express from "express";
import {
  registerGuestbook,
  checkGuestbook,
  getUserContent,
  sendFriendReq,
  handleFriendReq,
  verifyUserCode,
  postUserRegister,
  postLogin,
  getSearchUser,
  getRandomUser,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/").post(postUserRegister);
userRouter.route("/verify").post(verifyUserCode);
userRouter.route("/login").post(postLogin);
userRouter.route("/:id([0-9a-f]{24})/guestbook").post(registerGuestbook);
userRouter.route("/:id([0-9a-f]{24})/content").get(getUserContent);
userRouter.route("/:id([0-9a-f]{24})/guestbooks").get(checkGuestbook);
userRouter.route("/sendFriendRequest").post(sendFriendReq);
userRouter.route("/handleFriendRequest").post(handleFriendReq);
userRouter.route("/search").get(getSearchUser);
userRouter.route("/surfing").get(getRandomUser);

export default userRouter;
