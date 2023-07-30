import Board from '../models/Board';
import User from '../models/User';
import { uploadFileToS3 } from '../../util/s3';

export const watch = async (req, res, next) => {
  const { id } = req.params;
  const board = await Board.findById(id).populate('owner');

  if (board === null) {
    return res.status(404).render('404', { pageTitle: 'Board not found' });
  }
  return res.render('boards/watch', { pageTitle: board.title, board });
};

export const getBoard = (req, res) => {
  return res.render('boards/upload', { pageTitle: 'Upload' });
};

export const postBoardCreate = async (req, res, next) => {
  try {
    const {
      session: {
        user: { _id },
      },
      body: { title, content },
    } = req;
    // 파일 업로드
    console.log('업로드 시도!');
    console.log(req.file);

    console.log(req.session);
    console.log(req.body);

    // 파일을 S3에 업로드하고, 업로드된 파일의 S3 URL을 얻어오는 함수
    const fileUrl = await uploadFileToS3(req.file);

    console.log('스키마 작성 시도!');
    // 게시물 생성
    const createdBoard = await Board.create({
      title,
      content,
      fileUrl, // S3에서 얻어온 URL을 게시물의 fileUrl 속성으로 저장
      owner: _id,
    });

    console.log('업로드 및 스키마 작성 성공!');
    // 게시물 생성 성공 시, 유저의 boards 배열에 게시물 ID 추가
    const user = await User.findById(_id);
    user.boards.push(createdBoard._id);
    await user.save();

    return res.redirect('/');
  } catch (err) {
    console.error('Error while creating board:', err);
    return res.status(400).render('boards/upload', {
      pageTitle: 'Create Board',
      errorMsg: err.message,
    });
  }
};

export const deleteBoard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).render('404', { pageTitle: 'Board not found' });
    }

    if (board.owner.toString() !== req.session.user._id.toString()) {
      return res.status(403).redirect('/');
    }

    await Board.findByIdAndDelete(id);

    return res.redirect('/');
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
