import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    "3.35.5.22:8080",
    "localhost:3000",
    "15.165.161.217:8080",
  ];

  const origin = req.headers;
  if (allowedOrigins.includes(origin.host)) {
    res.setHeader("Access-Control-Allow-Origin", origin.host);
    res.setHeader("Access-Control-Allow-Methods", "*"); // 모든 메소드 허용
  } else {
    return res.status(403).send("Forbidden");
  }

  next();
};

dotenv.config();

export const auth = (req, res, next) => {
  const key = process.env.SECRET_KEY;
  // 인증 완료
  try {
    // 요청 헤더에 저장된 토큰(req.headers.authorization)과 비밀키를 사용하여 토큰을 req.decoded에 반환
    req.decoded = jwt.verify(req.headers.authorization, key);
    next();
  } catch (error) {
    // 인증 실패
    // 유효시간이 초과된 경우
    if (error.name === "TokenExpiredError") {
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다.",
      });
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        code: 401,
        message: "유효하지 않은 토큰입니다.",
      });
    }
  }
};
