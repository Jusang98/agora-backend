import jwt from 'jsonwebtoken';
import multer from 'multer';

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

//s3 업로드 용 코드
const storage = multer.memoryStorage(); // 파일을 디스크에 저장하지 않고 메모리에 유지하도록 설정
export const multerMiddleware = multer({ storage }).single('file'); // 'file'은 폼(input 엘리먼트)의 name 속성과 일치해야 합니다.

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
