import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Guestbook from '../models/Guestbook';
import nodemailer from 'nodemailer';

export const home = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.render('home', { pageTitle: 'Home', users }); // pug에 변수 보내주기
  } catch {
    return res.sendStatus(404);
  }
};

export const getLogin = async (req, res, next) => {
  return res.render('login', { pageTitle: '로그인' });
};

export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.validateUser(email, password);
  console.log('로그인한 유저 :', user);
  if (!user) {
    return res.status(401).send('유효하지않은 인증입니다.');
  }

  const verifyPassword = await bcrypt.compare(password, user.password);
  if (!verifyPassword) {
    return res.status(400).send('비밀번호가 일치하지 않습니다.');
  }

  req.session.loggedIn = true;
  req.session.user = user;

  return res.redirect('/');

  /*
  const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET);

  return res.status(200).json({
    code: 200,
    message: "token is created",
    token: token,
  });
  */
};

export const logout = (req, res, next) => {
  req.session.destroy();

  return res.redirect('/');
};

export const getUserRegister = async (req, res, next) => {
  return res.render('userRegister', { pageTitle: '회원 가입' });
};

export const postUserRegister = async (req, res, next) => {
  const { email, password, password2, nickname, characterNum } = req.body;
  const pageTitle = '회원 가입';
  if (password !== password2) {
    return res.status(400).render('userRegister', {
      pageTitle,
      errMessage: '비밀번호가 일치하지 않습니다.',
    });
  }

  const userExists = await User.exists({ $or: [{ email }, { nickname }] }); //username이나 email 둘 중 하나라도 존재한다면 true 반환.
  if (userExists) {
    return res.status(400).render('userRegister', {
      pageTitle,
      errMessage: '존재하는 계정 입니다.',
    });
  }

  try {
    const newUser = await User.create({
      email,
      password,
      nickname,
      characterNum,
    });

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: newUser.email,
      subject: 'Email Verification',
      html: `<h1>1시간 내로 인증 바람!!!</h1><h2>Click the link to verify your email: http://15.164.176.168:8080/verify/${token}</h2>`,
    };

    await transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
        return res.status(500).send('An error occurred while sending email');
      } else {
        console.log('Email sent: ' + info.response);
        return res.send('Registration successful. Please verify your email.');
      }
    });

    // return res.json(newUser);
    //return res.redirect("/login");
  } catch (err) {
    console.error('ERROR :', err);
  }
};

export const verifyUserEmail = async (req, res, next) => {
  try {
    const decoded = jwt.verify(
      req.params.token,
      process.env.ACCESS_TOKEN_SECRET
    );
    console.log(decoded);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).send('User not found.');

    user.isVerified = true;
    await user.save();

    console.log('Email verification successful.');
    return res.redirect('/login');
  } catch (err) {
    return res.status(400).send('Invalid or expired token.');
  }
};

export const getSearchUser = async (req, res, next) => {
  const { searchUser } = req.query;

  let users = [];
  if (searchUser) {
    users = await User.find({
      nickname: {
        $regex: new RegExp(searchUser, 'i'),
      },
    });
  }

  return res.render('search', { pageTitle: '유저 검색', users });
};

export const seeUserProfile = async (req, res, next) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;

  const pageOwner = await User.findById(id)
    .populate('boards')
    .populate('videos')
    .populate('images');
  const visitor = await User.findById(_id);
  let friendExist = false;

  if (visitor.nickname in pageOwner.friends) {
    friendExist = true;
  }

  if (!pageOwner) {
    return res
      .status(404)
      .render('404', { pageTitle: 'User not found', friendExist });
  }

  return res.render('users/profile', {
    pageTitle: `${pageOwner.nickname} Profile`,
    pageOwner,
    friendExist,
  });
};

export const getEdit = (req, res, next) => {
  return res.render('users/edit-profile', { pageTitle: 'Edit Profile' });
};

export const postEdit = async (req, res, next) => {
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
      return res.status(404).render('users/edit-profile', {
        pageTitle: 'Edit Profile',
        errMessage: '이미 존재하는 아이디(또는 메일)입니다.',
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      email,
      nickname,
    },
    { new: true }
  );
  req.session.user = updatedUser;

  return res.redirect('/');
};

export const getGuestbook = async (req, res, next) => {
  return res.render('guestbook', { pageTitle: '방명록 남기기' });
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
  const guestbooks = await Guestbook.find().populate('writer');

  return res.render('users/myGuestbooks', { pageTitle: '방명록', guestbooks });
};

export const getChangePassword = (req, res, next) => {
  return res.render('users/changePassword', { pageTitle: '비밀번호 변경' });
};

export const postChangePassword = async (req, res, next) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPassword1 },
  } = req;
  const user = await User.findById(_id);

  if (newPassword !== newPassword1) {
    return res.status(400).render('users/change-pw', {
      pageTitle: 'Change Password',
      errMessage: '새 비밀번호가 일치하지 않습니다.',
    });
  }

  const checkPassword = await bcrypt.compare(oldPassword, user.password);
  if (!checkPassword) {
    return res.status(400).render('users/change-pw', {
      pageTitle: 'Change Password',
      errMessage: '비밀번호가 일치하지 않습니다.',
    });
  }

  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password;

  return res.redirect('/users/logout');
};

/*------------------ Controllers for API ROUTER ------------------*/
export const sendFriendReq = async (req, res, next) => {
  const { to, from } = req.body;

  const fromUser = await User.findOne({ email: from });
  const toUser = await User.findOne({ email: to });

  if (!fromUser || !toUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (toUser.friends.includes(fromUser.nickname)) {
    return res.status(400).json({ message: '이미 요청을 보냈습니다' });
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
      return res.status(404).json({ message: 'User not found' });
    }

    toUser.friendsRequests = toUser.friendsRequests.filter(
      (req) => req.toString() !== fromUser.nickname.toString()
    );

    if (action === 'accept') {
      fromUser.friends.push(toUser.nickname);
      toUser.friends.push(fromUser.nickname);
    }

    await fromUser.save();
    await toUser.save();

    res.json({ message: `Friend request ${action}ed` });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
/*--------------------------------------------------------------- */
