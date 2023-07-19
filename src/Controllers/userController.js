import User from "../models/User";

export const home = async (req, res, next) => {
  try {
    await User.sync({ alter: true });
    const newUser = await User.create({
      username: "park sunghwan",
      email: "sunghwan@email.com",
      location: "Seoul",
    });
    console.log(newUser);
    return res.send(newUser.toJSON());
  } catch (err) {
    return res.end();
  }
};

export const postJoin = (req, res, next) => {};
