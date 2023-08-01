import Board from '../models/Board';
import User from '../models/User';
import { uploadFileToS3 } from '../../util/s3';
//수정 -> 함수명 변경 + 기존의 코드(empty전송) -> 수정된코드(해당 유저아이디 받아서 작성한 게시물 전부 가져옴)
export const getUserBoards = async (req, res, next) => {
  const { id } = req.params; // 유저의 아이디
  const user = await User.findById(id).populate('boards');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.boards.length === 0) {
    return res.status(200).json({ message: 'No boards found for this user' });
  }

  return res.status(200).json(user.boards);
};

export const deleteBoard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id).populate('owner');
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
    console.log(fileUrl);
    return res.status(200).json(createdBoard); //  return res.status(200), json(user.boards); 문법 오류 고침
  } catch (err) {
    console.error('Error while creating board:', err);
    return res.status(400).json({
      message: 'fail',
    });
  }
};

// 수정 tv에 나오는 video용 함수
export const registerVideo = async (req, res, next) => {
  try {
    const { email } = req.body;
    const title = 'tv';
    const content = 'tv';
    const user = await User.findOne({ email });
    // 파일을 S3에 업로드하고, 업로드된 파일의 S3 URL을 얻어오는 함수
    const fileUrl = await uploadFileToS3(req.file);
    // 게시물 생성
    const createdBoard = await Board.create({
      title: title,
      content: content,
      fileUrl, // S3에서 얻어온 URL을 게시물의 fileUrl 속성으로 저장
      owner: user,
    });

    // 게시물 생성 성공 시, 유저의 boards 배열에 게시물 ID 추가;
    user.boards.push(createdBoard);
    await user.save();
    console.log(fileUrl);
    return res.status(200).json(fileUrl); //  return res.status(200), json(user.boards); 문법 오류 고침
  } catch (err) {
    console.error('Error while creating board:', err);
    return res.status(400).json({
      message: 'fail',
    });
  }
};
//

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
