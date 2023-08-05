import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  houseNum: {
    type: Number,
    required: true,
  },
  verificationCode: {
    type: String,
    required: false,
  },
  verificationCodeExpiration: {
    type: Date,
    required: false,
  },
  isVerified: { type: Boolean, default: false },
  friends: [{ type: String }],
  friendsRequests: [{ type: String }],
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
  guestbooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Guestbook" }],
});

userSchema.static("validateUser", async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return null;
  }

  return user;
});

const User = mongoose.model("User", userSchema);
export default User;
