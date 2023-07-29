import express from "express";
import {
  watch,
  upload,
  postImageUpload,
  deleteImage,
} from "../controllers/imageController";
import { multerMiddlewareImage } from "../middlewares";

const imageRouter = express.Router();

imageRouter.route("/:id([0-9a-f]{24})").get(watch);
imageRouter.route("/:id([0-9a-f]{24})/delete").get(deleteImage);
imageRouter
  .route("/upload")
  .get(upload)
  .post(multerMiddlewareImage.single("image"), postImageUpload);

export default imageRouter;
