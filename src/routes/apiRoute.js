import express from "express";
import { sendFriendReq, handleFriendReq } from "../controllers/userController";
import {
  registerVideoView,
  registerVideoLike,
} from "../controllers/videoController";
import {
  registerImageView,
  registerImageLike,
} from "../controllers/imageController";
const apiRouter = express.Router();

apiRouter.route("/user/sendFriendRequest").post(sendFriendReq);
apiRouter.route("/user/handleFriendRequest").post(handleFriendReq);

apiRouter.route("/images/:id([0-9a-f]{24})/views").post(registerImageView);
apiRouter.route("/images/:id([0-9a-f]{24})/likes").post(registerImageLike);

apiRouter.route("/videos/:id([0-9a-f]{24})/views").post(registerVideoView);
apiRouter.route("/videos/:id([0-9a-f]{24})/likes").post(registerVideoLike);

export default apiRouter;
