import "./db";
import expressServer from "./socketIO";

expressServer.listen(process.env.EC2_PORT, console.log("Express 연결...!"));
