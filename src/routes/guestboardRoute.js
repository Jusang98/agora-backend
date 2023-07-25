import express from "express";
import { authMiddleware } from "../middlewares";
import {
  uploadGuestBoard,
  updateGuestBoard,
  deleteGuestBoard,
} from "../controllers/guestboardController";

const guestboardRouter = express.Router();

guestboardRouter.route("/:id/upload-board").post(uploadGuestBoard);
guestboardRouter.route("/:id/update-board").put(updateGuestBoard);
guestboardRouter
  .route("/:id/delete-board")
  .delete(authMiddleware, deleteGuestBoard);

export default guestboardRouter;
