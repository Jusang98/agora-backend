import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  meta: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const Image = mongoose.model("Image", imageSchema);
export default Image;
