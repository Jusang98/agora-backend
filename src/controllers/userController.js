import User from '../models/User';
import jwt from 'jsonwebtoken';
export const home = (req, res, next) => {
  return res.render('home', { pageTitle: 'Home' });
};
//jwt 추가할거임
export const getLogin = (req, res, next) => {
  return res.render('login', { pageTitle: 'Login' });
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
    return res.render('userRegister', { pageTitle: '회원 가입' });
  }
  let token = '';
  token = jwt.sign(
    {
      type: 'JWT',
      user_email: user_email,
    },
    key,
    {
      expiresIn: '30m', // 15분후 만료
      issuer: '상주',
    }
  );
  res.status(200).json({
    code: 200,
    message: 'token is created',
    token: token,
  });
  
  if (!user) {
    return res.render('userRegister', { pageTitle: '회원 가입' });
  }
  return res.send('로그인 완료!');
};

// export const postLogin = async (req, res, next) => {
//   const { user_email } = req.body;

//   const user = await User.findOne({
//     where: {
//       user_email,
//     },
//   });
//   if (!user) {
//     return res.render('userRegister', { pageTitle: '회원 가입' });
//   }
//   return res.send('로그인 완료!');
// };

export const getUserRegister = (req, res, next) => {
  return res.render('userRegister', { pageTitle: '회원 가입' });
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
  if (!newUser) {
    console.log('회원가입 실패 이미 있는 아이디');
    return res.render('error', { pageTitle: '회원가입 실패' });
  }
  console.log('회원 가입한 유저 :', newUser);
  return res.render('login', { pageTitle: 'Login' });
};
