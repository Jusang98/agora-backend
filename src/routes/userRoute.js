import express from "express";
import {
  seeUserProfile,
  getGuestbook,
  postGuestbook,
  checkGuestbook,
  getFriends,
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import { protectorMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.route("/:id([0-9a-f]{24})").get(protectorMiddleware, seeUserProfile);
userRouter
  .route("/:id([0-9a-f]{24})/guestbook")
  .all(protectorMiddleware)
  .get(getGuestbook)
  .post(postGuestbook);
userRouter
  .route("/:id([0-9a-f]{24})/checkGuestbook")
  .get(protectorMiddleware, checkGuestbook);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter
  .route("/change-password")
  .get(getChangePassword)
  .post(postChangePassword);

export default userRouter;
