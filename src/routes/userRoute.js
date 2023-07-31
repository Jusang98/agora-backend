import express from "express";
import {
  seeUserProfile,
  registerGuestbook,
  checkGuestbook,
  userInfoEdit,
  password,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/:id([0-9a-f]{24})").get(seeUserProfile);
userRouter.route("/:id([0-9a-f]{24})/guestbooks").get(checkGuestbook);
userRouter.route("/:id([0-9a-f]{24})/guestbook").post(registerGuestbook);
userRouter.route("/edit").post(userInfoEdit);
userRouter.route("/password").put(password);

export default userRouter;
