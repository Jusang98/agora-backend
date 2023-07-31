import Board from "../models/Board";
import User from "../models/User";
import { uploadFileToS3 } from "../../util/s3";

export const getBoard = async (req, res, next) => {
  const { id } = req.params;
  const board = await Board.findById(id);

  if (!board) {
    return res.status(200).json({ message: "Empty" });
  }
  return res.status(200).json(board);
};

export const deleteBoard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id).populate("owner");
    const owner = board.owner;

    await Board.findByIdAndDelete(id);
    await Board.save();

    return res.json(owner.boards);
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

export const registerBoard = async (req, res, next) => {
  try {
    const { title, content, email } = req.body;

    const user = await User.findOne({ email });
    // 파일을 S3에 업로드하고, 업로드된 파일의 S3 URL을 얻어오는 함수
    const fileUrl = await uploadFileToS3(req.file);
    // 게시물 생성
    const createdBoard = await Board.create({
      title,
      content,
      fileUrl, // S3에서 얻어온 URL을 게시물의 fileUrl 속성으로 저장
      owner: user,
    });

    // 게시물 생성 성공 시, 유저의 boards 배열에 게시물 ID 추가;
    user.boards.push(createdBoard);
    await user.save();

    return res.status(200), json(user.boards);
  } catch (err) {
    console.error("Error while creating board:", err);
    return res.status(400).json({
      message: "fail",
    });
  }
};

// export const editBoard = async (req, res, next) => {
//     const { id } = req.params;
//     const { title, content } = req.body;
//     const video = await Video.exists({ _id: id });
//     if (!video) {
//       return res.status(404).render("404", { pageTitle: "Video not found" });
//     }
//     if (video.owner.toString() !== req.session.user._id.toString()) {
//       return res.status(403).redirect("/");
//     }
//     await Video.findByIdAndUpdate(id, {
//       title,
//     });
//     return res.redirect("/");
// };

/*------------------ Controllers for API ROUTER ------------------*/
export const registerBoardView = async (req, rex, next) => {
  const { id } = req.params;
  const board = await Board.findById(id);
  if (!board) {
    return res.sendStatus(404);
  }
  board.meta.views = board.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};
export const registerBoardLike = async (req, rex, next) => {
  const { id } = req.params;
  const board = await Board.findById(id);
  if (!board) {
    return res.sendStatus(404);
  }
  board.meta.likes = board.meta.likes + 1;
  await board.save();
  return res.sendStatus(200);
};
/*--------------------------------------------------------------- */
