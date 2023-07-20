import "./db";
import app from "./app";

app.listen(process.env.EC2_PORT, console.log("Express 연결...!"));
