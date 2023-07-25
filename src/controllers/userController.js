import User from "../models/User";
import Map from "../models/Map";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

export const home = (req, res, next) => {
  return res.render("home", { pageTitle: "Home" });
};
//jwt 추가할거임
export const getLogin = (req, res, next) => {
  return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res, next) => {
  const { user_email } = req.body;
  const key = process.env.ACCESS_TOKEN_SECRET;
  const user = await User.findOne({
    where: {
      user_email,
    },
  });

  if (!user) {
    return res.render("userRegister", { pageTitle: "회원 가입" });
  }

  let token = "";
  token = jwt.sign(
    {
      type: "JWT",
      user_email: user.user_email,
    },
    key,
    {
      expiresIn: "30m", // 15분후 만료
      issuer: "상주",
    }
  );
  console.log("token", token);
  return res.status(200).json({
    code: 200,
    message: "token is created",
    token: token,
  });
};

export const getUserRegister = (req, res, next) => {
  return res.render("userRegister", { pageTitle: "회원 가입" });
};
// postUserRegister 생성 실패시 오류 메세지 반환으로 수정
export const postUserRegister = async (req, res, next) => {
  const { user_email, user_pwd, user_nickname, user_character_num } = req.body;
  const newUser = await User.create({
    user_email,
    user_pwd,
    user_nickname,
    user_character_num,
  });

  console.log("회원 가입한 유저 :", newUser);
  return res.render("login", { pageTitle: "Login" });
};

export const searchMap = async (req, res, next) => {
  try {
    const { tag } = req.query;
    let Maps = [];
    if (tag) {
      Maps = await Map.findAll({
        where: {
          map_tag: {
            [Op.like]: `%${tag}%`,
          },
        },
      });
    }

    return res.status(201).json(Maps);
  } catch (err) {}
};
