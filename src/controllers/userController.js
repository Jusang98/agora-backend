import User from "../models/User";

export const home = (req, res, next) => {
  return res.render("home", { pageTitle: "Home" });
};

export const getLogin = (req, res, next) => {
  return res.render("login", { pageTitle: "Login" });
};
export const postLogin = async (req, res, next) => {
  const { user_email } = req.body;
  const user = await User.findOne({
    where: {
      user_email,
    },
  });
  if (!user) {
    return res.render("userRegister", { pageTitle: "회원 가입" });
  }
  return res.send("로그인 완료!");
};

export const getUserRegister = (req, res, next) => {
  return res.render("userRegister", { pageTitle: "회원 가입" });
};

export const postUserRegister = async (req, res, next) => {
  const { user_email, user_pwd, user_nickname, user_character_num } = req.body;
  try {
    const newUser = await User.create({
      user_email,
      user_pwd,
      user_nickname,
      user_character_num,
    });

    console.log("회원 가입한 유저 :", newUser);
    return res.json(newUser);
  } catch (err) {
    console.error("ERROR", err);
    return res.end();
  }
};
