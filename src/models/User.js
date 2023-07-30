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
    unique: true,
  },
  characterNum: {
    type: Number,
    required: true,
  },
  friends: [{ type: String }],
  friendsRequests: [{ type: String }],
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
  guestbooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Guestbook" }],
});

//Hashing password before save User Info
userSchema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 5);
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
