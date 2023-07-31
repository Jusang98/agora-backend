import express from "express";
import { sendFriendReq, handleFriendReq } from "../controllers/userController";

const apiRouter = express.Router();

apiRouter.route("/user/sendFriendRequest").post(sendFriendReq);
apiRouter.route("/user/handleFriendRequest").post(handleFriendReq);

apiRouter.route("/boards/:id([0-9a-f]{24})/views").put(registerBoardView);
apiRouter.route("/boards/:id([0-9a-f]{24})/likes").put(registerBoardLike);

export default apiRouter;
