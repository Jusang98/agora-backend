import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User";
import Guestbook from "../models/Guestbook";
import nodemailer from "nodemailer";
import Board from "../models/Board";
import path from "path";
import { URL } from "url";
import { client } from "../db";

const getFriendsInfo = async (fromUser) => {
  let friendsInfoArray = [];
  const fromUserFriends = fromUser.friends;
  for (const fromUserFriend of fromUserFriends) {
    const findUserFriend = await User.findOne({ nickname: fromUserFriend });
    const findUserFriendIdAndNickname = Object.entries(
      findUserFriend.toObject()
    ).reduce((obj, [key, value]) => {
      if (key === "_id" || key === "nickname" || key === "houseNum") {
        obj[key] = value;
      }
      return obj;
    }, {});
    friendsInfoArray.push(findUserFriendIdAndNickname);
  }
  return friendsInfoArray;
};

//postman 체크 완
export const verifyUserCode = async (req, res, next) => {
  const { email } = req.body;

  const userExists = await User.exists({ email }); //username이나 email 둘 중 하나라도 존재한다면 true 반환.
  if (userExists) {
    return res.status(400).json({
      errMessage: "존재하는 계정 입니다.",
    });
  }

  try {
    const verificationCode = crypto.randomBytes(3).toString("hex"); // 6자리의 랜덤 인증 코드 생성
    const verificationCodeExpiration = Date.now() + 3600000;

    const newUser = await User.create({
      email,
      password: "1",
      nickname: "temporary",
      houseNum: "1",
      verificationCode,
      verificationCodeExpiration,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: newUser.email,
      subject: "Email Verification",
      html: `<h1>1시간 내로 인증 바람!!!</h1><p>Your verification code is: ${verificationCode}</p>`,
    };
    // 링크클릭만 하는게 아니고, 인증번호를 클라이언트한테 보내서 인증번호가 맞으면 우리가 처리하는 식으로 변경하자!

    await transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
        return res.status(500).send("An error occurred while sending email");
      } else {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .send("Registration successful. Please verify your email.");
      }
    });
  } catch (err) {
    console.error("ERROR :", err);
  }
};

export const postUserRegister = async (req, res, next) => {
  const { email, password, password2, nickname, houseNum, code } = req.body;

  try {
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired verification code.");
    }

    if (password !== password2) {
      return res.status(400).send("비밀번호가 일치하지 않습니다.");
    }

    if (user.verificationCodeExpiration < Date.now()) {
      return res.status(400).send("코드 유효기간 만료.");
    }

    const newUser = await User.findOneAndUpdate(
      { email },
      {
        nickname,
        password: await bcrypt.hash(password, 5),
        houseNum,
        verificationCode: undefined,
        verificationCodeExpiration: undefined,
        isVerified: true,
        code: undefined,
      },
      { new: true }
    );
    await client.sAdd("users", JSON.stringify(newUser));

    return res.status(200).json({ message: "success" });
  } catch (err) {
    return res.status(400).send("An error occurred during email verification.");
  }
};

// postman 체크 완
export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.validateUser(email, password);
  if (!user) {
    return res.status(401).send("유효하지않은 인증입니다.");
  }

  const verifyPassword = await bcrypt.compare(password, user.password);
  if (!verifyPassword) {
    return res.status(400).send("비밀번호가 일치하지 않습니다.");
  }

  return res.status(200).json(user);
};

export const getSearchUser = async (req, res, next) => {
  const { user } = req.query;

  let users = [];
  if (user) {
    users = await User.find({
      nickname: {
        $regex: new RegExp(user, "i"),
      },
    });
  }

  return res.status(200).json(users);
};

//postman check 완
export const registerGuestbook = async (req, res, next) => {
  const {
    body: { email, content },
    params: { id },
  } = req;

  const writer = await User.findOne({ email });
  const receiver = await User.findById(id);
  const guestbook = await Guestbook.create({
    content,
    writer: writer._id,
    receiver: receiver._id,
  });
  receiver.guestbooks.push(guestbook._id);
  await receiver.save();

  return res.status(200).json(receiver);
};

// 수정 - 닉네임도 같이보내게
export const checkGuestbook = async (req, res, next) => {
  const { id } = req.params;
  const pageOwner = await User.findById(id).populate({
    path: "guestbooks",
    populate: {
      path: "writer",
      select: "nickname",
    },
  });

  return res.status(200).json(pageOwner.guestbooks);
};
//postman check 완
export const password = async (req, res, next) => {
  const { email, oldPassword, newPassword, newPassword1 } = req.body;
  const user = await User.findOne({ email });

  if (newPassword !== newPassword1) {
    return res.status(400).json({
      message: "새 비밀번호가 일치하지 않습니다.",
    });
  }

  const checkPassword = await bcrypt.compare(oldPassword, user.password);
  if (!checkPassword) {
    return res.status(400).json({
      errMessage: "비밀번호가 일치하지 않습니다.",
    });
  }

  user.password = await bcrypt.hash(newPassword, 5);
  await user.save();

  return res.status(200).json({ message: "success" });
};

/*------------------ Controllers for API ROUTER ------------------*/
export const sendFriendReq = async (req, res, next) => {
  const { to, from } = req.body;

  const fromUser = await User.findOne({ email: from });
  const toUser = await User.findOne({ email: to });

  if (!fromUser || !toUser) {
    return res.status(404).json({ message: "User not found" });
  }

  if (toUser.friends.includes(fromUser.nickname)) {
    return res.status(400).json({ message: "이미 요청을 보냈습니다" });
  }

  try {
    toUser.friendsRequests.push(fromUser.nickname);
    await toUser.save();

    return res.sendStatus(200);
  } catch {
    return res.sendStatus(400);
  }
};

export const handleFriendReq = async (req, res, next) => {
  const { from, to } = req.body;

  try {
    const fromUser = await User.findOne({ email: from });
    const toUser = await User.findOne({ email: to });

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    toUser.friendsRequests = toUser.friendsRequests.filter(
      (req) => req.toString() !== fromUser.nickname.toString()
    );

    fromUser.friends.push(toUser.nickname);
    toUser.friends.push(fromUser.nickname);

    await fromUser.save();
    await toUser.save();

    const friendsInfoArray = await getFriendsInfo(fromUser);

    return res.status(200).json(friendsInfoArray);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
/*--------------------------------------------------------------- */
// 수정 추가 해당유저의 id를 가지고 게시물과 방명록을 전부 가져오는거
export const getUserContent = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    const userHouseNum = user.houseNum;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let boards = await Board.find({ owner: id }).sort({ createdAt: -1 });
    if (!boards) boards = [];

    let guestbooks = await Guestbook.find({
      $or: [{ writer: id }, { receiver: id }],
    })
      .populate("writer", "nickname")
      .sort({ createdAt: -1 });

    if (!guestbooks) guestbooks = [];

    const imageExtensions = [".png", ".jpeg", ".jpg"];
    const imageBoards = boards.filter((board) => {
      // fileUrl로부터 파일 이름 및 확장자 추출
      const filePath = new URL(board.fileUrl).pathname;
      const extension = path.extname(filePath);

      return imageExtensions.includes(extension);
    });

    const mp4Boards = boards.filter((board) => {
      // fileUrl로부터 파일 이름 및 확장자 추출
      const filePath = new URL(board.fileUrl).pathname;
      const extension = path.extname(filePath);

      return extension === ".mp4";
    });

    const friendsInfoArray = await getFriendsInfo(user);

    return res.status(200).json({
      imageBoards,
      guestbooks,
      mp4Boards,
      userHouseNum,
      friendsInfoArray,
    });
  } catch (error) {
    console.error("Error while fetching user content:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getRandomUser = async (req, res, next) => {
  const users = await client.get("users");
  if (!users) {
    return null;
  }
  const parsedUsers = JSON.parse(users);
  const randomUserId = parsedUsers.shift();
  const randomUser = await User.findById(randomUserId);
  parsedUsers.push(randomUserId);
  client.set("users", JSON.stringify(parsedUsers));
  return res.status(200).json(randomUser);
};
