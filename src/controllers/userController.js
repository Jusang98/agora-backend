import jwt from "jsonwebtoken";
import User from "../models/User";
import Video from "../models/Video";
import Guestbook from "../models/Guestbook";
import bcrypt from "bcrypt";

/*------------------------------------------------------------------------------*/
const validateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return null;
  }

  return user;
};
/*------------------------------------------------------------------------------*/

export const home = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.render("home", { pageTitle: "Home", users }); // pug에 변수 보내주기
  } catch {
    return res.end();
  }
};

export const getLogin = async (req, res, next) => {
  return res.render("login", { pageTitle: "로그인" });
};

export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await validateUser(email, password);
  if (!user) {
    return res.status(401).send("유효하지않은 인증입니다.");
  }

  req.session.loggedIn = true;
  req.session.user = user;

  return res.redirect("/");

  // const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET);

  // return res.status(200).json({
  //   code: 200,
  //   message: "token is created",
  //   token: token,
  // });
};

export const logout = (req, res, next) => {
  req.session.destroy();

  return res.redirect("/");
};

export const getUserRegister = async (req, res, next) => {
  return res.render("userRegister", { pageTitle: "회원 가입" });
};

export const postUserRegister = async (req, res, next) => {
  const { email, password, password2, nickname, characterNum } = req.body;
  const pageTitle = "회원 가입";
  if (password !== password2) {
    return res.status(400).render("userRegister", {
      pageTitle,
      errMessage: "비밀번호가 일치하지 않습니다.",
    });
  }

  const userExists = await User.exists({ $or: [{ email }, { nickname }] }); //username이나 email 둘 중 하나라도 존재한다면 true 반환.
  if (userExists) {
    return res.status(400).render("userRegister", {
      pageTitle,
      errMessage: "존재하는 계정 입니다.",
    });
  }

  try {
    const newUser = await User.create({
      email,
      password,
      nickname,
      characterNum,
    });

    // return res.json(newUser);
    return res.redirect("/login");
  } catch (err) {
    console.error("ERROR :", err);
  }
};

export const getSearchUser = async (req, res, next) => {
  const { searchUser } = req.query;
  console.log("리퀘스트 확인 : ", req);
  let users = [];
  if (searchUser) {
    users = await User.find({
      nickname: {
        $regex: new RegExp(searchUser, "i"), //대소문자 구분없이 searchUser를 포함하고있으면 모두 검색(몽고DB 기능))
      },
    });
  }

  return res.render("search", { pageTitle: "유저 검색", users });
};

export const seeUserProfile = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos").populate("images");

  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }

  return res.render("users/profile", {
    pageTitle: `${user.nickname} Profile`,
    user,
    videos: user.videos,
    images: user.images,
  });
};

export const getEdit = (req, res, next) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res, next) => {
  // const _id = req.session.user._id;
  // const { name, email, nickname } = req.body; 아래 코드와 동일
  const {
    session: {
      user: { _id, email: sessionEmail, nickname: sessionNickname },
    },
    body: { email, nickname },
  } = req;

  let InfoToChange = [];
  if (email !== sessionEmail) {
    InfoToChange.push({ email });
  }
  if (nickname !== sessionNickname) {
    InfoToChange.push({ nickname });
  }
  if (InfoToChange.length > 0) {
    const user = await User.findOne({ $or: InfoToChange });
    if (user && user._id.toString() !== _id) {
      return res.status(404).render("users/edit-profile", {
        pageTitle: "Edit Profile",
        errMessage: "이미 존재하는 아이디(또는 메일)입니다.",
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      email,
      nickname,
    },
    { new: true } // data를 update한 후 update된 데이터를 리턴하도록 설정.
  );
  req.session.user = updatedUser;

  return res.redirect("/");
};

export const getGuestbook = async (req, res, next) => {
  if (req.session.loggedIn === false) {
    return res.render("login", { pageTitle: "로그인" });
  }
  return res.render("guestbook", { pageTitle: "방명록 남기기" });
};

export const postGuestbook = async (req, res, next) => {
  const {
    session: {
      user: { _id },
    },
    body: { content },
    params: { id },
  } = req;

  const writer = await User.findById(_id);
  const receiver = await User.findById(id);
  const guestbook = await Guestbook.create({
    content,
    writer,
    receiver,
  });
  receiver.guestbooks.push(guestbook);
  await receiver.save();

  return res.redirect(`/user/${receiver.id}`);
};

export const checkGuestbook = async (req, res, next) => {
  const guestbooks = await Guestbook.find().populate("writer");

  return res.render("users/myGuestbooks", { pageTitle: "방명록", guestbooks });
};
