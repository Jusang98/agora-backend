export const corsMiddleware = (req, res, next) => {
  const allowedOrigins = ["3.35.5.22:8080", "localhost:3000"];

  const origin = req.headers;
  if (allowedOrigins.includes(origin.host)) {
    res.setHeader("Access-Control-Allow-Origin", origin.host);
    res.setHeader("Access-Control-Allow-Methods", "*"); // 모든 메소드 허용
  } else {
    return res.status(403).send("Forbidden");
  }

  next();
};
