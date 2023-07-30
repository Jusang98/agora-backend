import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  deleteVideo,
  upload,
  postVideoUpload,
} from "../controllers/videoController";
import { multerMiddlewareVideo, protectorMiddleware } from "../middlewares";

const videoRouter = express.Router();

videoRouter.route("/:id([0-9a-f]{24})").get(watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .get(protectorMiddleware, deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(upload)
  .post(multerMiddlewareVideo.single("video"), postVideoUpload);

export default videoRouter;
