import Board from '../models/Board';
// import Selectboard from '../models/Selectboard';
import User from '../models/User';
import { uploadFileToS3 } from '../s3';

//수정 -> 함수명 변경 + 기존의 코드(empty전송) -> 수정된코드(해당 유저아이디 받아서 작성한 게시물 전부 가져옴)
export const getBoardList = async (req, res, next) => {
  const { userId } = req.params; // 유저의 아이디
  const user = await User.findById(userId).populate('boards');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.boards.length === 0) {
    return res.status(200).json({ message: 'No boards found for this user' });
  }

  return res.status(200).json(user.boards);
};

// 추가 -> 해당 게시물 id 받아서 그 게시물 정보 보내줌
export const getBoard = async (req, res, next) => {
  const { boardId } = req.params; // 게시물의 아이디

  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    return res.status(200).json(board);
  } catch (error) {
    console.error('Error while fetching the board:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// 추가 selectboard에도 추가하는 함수
// 데이터가 6개 넘으면 가장 오래된 데이터 지우고 바뀜
// const MAX_DOCUMENTS = 6;
// async function addSelectboard(data) {
//   const count = await Selectboard.countDocuments();
//   if (count >= MAX_DOCUMENTS) {
//     // 가장 오래된 데이터 삭제
//     await Selectboard.findOneAndDelete({}, { sort: { createdAt: 1 } });
//   }
//   return Selectboard.create(data);
// }

// 액자의 게시물 즉 selectboard 수정하는 함수
export const modifySelectBoards = async (req, res, next) => {
  const { boardId } = req.params; // 게시물의 아이디

  try {
    const selectBoard = await Selectboard.findById(boardId);
    if (!selectBoard) {
      return res.status(404).json({ message: 'Board not found' });
    }

    return res.status(200).json(selectBoard);
  } catch (error) {
    console.error('Error while fetching the board:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
// 액자리스트 즉 selectboard리스트를 보내주는 함수

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
    const fileUrl = await uploadFileToS3(req.file);

    // 파일 URL에서 쿼리 파라미터 제거
    const parsedUrl = new URL(fileUrl);
    const cleanFileUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;

    const createdBoard = await Board.create({
      title,
      content,
      fileUrl: cleanFileUrl,
      owner: user._id,
    });

    user.boards.push(createdBoard);
    await user.save();
    // addSelectboard(createdBoard);

    const imageBoards = await Board.find({
      owner: user._id,  
      fileUrl: { $in: [/\.png$/, /\.jpeg$/, /\.jpg$/] }
    }).sort({ createdAt: -1 }); 

    return res.status(200).json(imageBoards);
  } catch (err) {
    console.error('Error while creating board:', err);
    return res.status(400).json({
      message: 'fail',
    });
  }
};

export const registerVideo = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    // 파일을 S3에 업로드하고, 업로드된 파일의 S3 URL을 얻어오는 함수
    const fileUrl = await uploadFileToS3(req.file);
    // 게시물 생성
    const createdBoard = await Board.create({
      title: 'tv',
      content: 'tv',
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
export const handleBoardEvent = async (req, rex, next) => {
  const {
    params: { id },
    body: { action },
  } = req;
  const board = await Board.findById(id);
  if (!board) {
    return res.sendStatus(404);
  }

  switch (action) {
    case 'view':
      board.meta.views = board.meta.views + 1;
      break;
    case 'like':
      board.meta.likes = board.meta.likes + 1;
      break;
    default:
      return res.status(400).send('Invalid action');
  }

  await board.save();
  return res.sendStatus(200);
};
/*--------------------------------------------------------------- */
