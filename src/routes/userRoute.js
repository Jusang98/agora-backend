import express from "express";
import {
  seeUserProfile,
  logout,
  getEdit,
  postEdit,
  getGuestbook,
  postGuestbook,
  checkGuestbook,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/:id([0-9a-f]{24})").get(seeUserProfile);
userRouter
  .route("/:id([0-9a-f]{24})/guestbook")
  .get(getGuestbook)
  .post(postGuestbook);
userRouter.route("/:id([0-9a-f]{24})/checkGuestbook").get(checkGuestbook);
userRouter.route("/logout").get(logout);
userRouter.route("/edit").get(getEdit).post(postEdit);

export default userRouter;
