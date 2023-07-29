import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, //비디오를 생성할 때만 Date.now 함수 실행
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
