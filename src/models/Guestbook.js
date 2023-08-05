import mongoose from "mongoose";

const GuestbookSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, //비디오를 생성할 때만 Date.now 함수 실행
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const Guestbook = mongoose.model("Guestbook", GuestbookSchema);
export default Guestbook;
