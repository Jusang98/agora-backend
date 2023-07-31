import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User";
import Guestbook from "../models/Guestbook";
import nodemailer from "nodemailer";

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
      characterNum: "1",
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
  const { email, password, password2, nickname, characterNum, code } = req.body;

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

    await User.findOneAndUpdate(
      { email },
      {
        nickname,
        password: await bcrypt.hash(password, 5),
        characterNum,
        verificationCode: undefined,
        verificationCodeExpiration: undefined,
        isVerified: true,
        code: undefined,
      },
      { new: true }
    );

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
export const seeUserProfile = async (req, res, next) => {
  const {
    params: { id },
  } = req;

  const pageOwner = await User.findById(id).populate("boards");

  if (!pageOwner) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(pageOwner);
};

//postman check 완
export const userInfoEdit = async (req, res, next) => {
  const { email, nickname, characterNum } = req.body;
  const findUser = await User.findOne({ email });

  let InfoToChange = [];
  if (characterNum !== findUser.characterNum) {
    InfoToChange.push({ characterNum });
  }
  if (nickname !== findUser.nickname) {
    InfoToChange.push({ nickname });
  }
  if (InfoToChange.length > 0) {
    const user = await User.findOne({ $or: InfoToChange });
    if (user) {
      return res.status(404).json({
        message: "이미 존재하는 아이디(또는 메일)입니다.",
      });
    }
  }

  await User.findOneAndUpdate(
    { email },
    {
      characterNum,
      nickname,
    },
    { new: true }
  );

  return res.status(200).json({ message: "success" });
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
    writer,
    receiver,
  });
  receiver.guestbooks.push(guestbook);
  await receiver.save();

  return res.status(200).json(receiver);
};

//postman check 완
export const checkGuestbook = async (req, res, next) => {
  const { id } = req.params;
  const pageOwner = await User.findById(id).populate("guestbooks");

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
  const { from, to, action } = req.body;

  try {
    const fromUser = await User.findOne({ email: from });
    const toUser = await User.findOne({ email: to });

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    toUser.friendsRequests = toUser.friendsRequests.filter(
      (req) => req.toString() !== fromUser.nickname.toString()
    );

    if (action === "accept") {
      fromUser.friends.push(toUser.nickname);
      toUser.friends.push(fromUser.nickname);
    }

    await fromUser.save();
    await toUser.save();

    res.json({ message: `Friend request ${action}ed` });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
/*--------------------------------------------------------------- */
