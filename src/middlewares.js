import jwt from 'jsonwebtoken';
import multer from 'multer';
import { s3Upload } from '../util/s3';
export const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    '13.209.19.79:8080',
    'localhost:3000',
    '15.165.161.217:8080',
    '15.164.176.168:8080',
    '3.35.5.145:8080',
  ];

  const origin = req.headers;
  if (allowedOrigins.includes(origin.host)) {
    res.setHeader('Access-Control-Allow-Origin', origin.host);
    res.setHeader('Access-Control-Allow-Methods', '*'); // 모든 메소드 허용
  } else {
    return res.status(403).send('Forbidden');
  }

  next();
};

export const localsMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    res.locals.loggedIn = true;
  } else {
    res.locals.loggedIn = false;
  }
  res.locals.loggedInUser = req.session.user;
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    return res.redirect('/login');
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    next();
  } else {
    return res.redirect('/');
  }
};

export const multerMiddlewareVideo = multer({
  dest: 'uploads/videos',
});

export const multerMiddlewareImage = multer({
  dest: 'uploads/images',
});
export const multerMiddlewareBoard = s3Upload;

/* jwt 토큰 인증 미들웨어 */
export const authMiddleware = (req, res, next) => {
  try {
    const key = process.env.ACCESS_TOKEN_SECRET;
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, key, (err, user) => {
        if (err) {
          throw new Error('Error verifying token');
        }

        req.user = user;
        next();
      });
    }
  } catch (error) {
    // 유효시간이 초과된 경우
    if (error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다.',
      });
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: '유효하지 않은 토큰입니다.',
      });
    }
    // 그 외의 에러
    return next(error);
  }
};
