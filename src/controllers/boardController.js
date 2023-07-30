import { s3Upload } from '../../util/s3';
import Board from '../models/Board';
import User from '../models/User';
export const watch = async (req, res, next) => {
  const { id } = req.params;
  const board = await Board.findById(id).populate('owner'); // 이 부분도 소문자로 변경

  if (board === null) {
    return res.status(404).render('404', { pageTitle: 'board not found' });
  }
  return res.render('boards/watch', { pageTitle: board.title, board });
};

export const getBoard = (req, res, next) => {
  return res.render('boards/upload', { pageTitle: 'Upload' });
};

export const postBoardUpload = async (req, res, next) => {
  const {
    session: {
      user: { _id },
    },
    body: { title, content },
  } = req;
  console.log(req.session);
  console.log(req.files);
  console.log('이거야?!!!!!!!!!!!!!!!!!!');
  console.log(req.body);

  s3Upload(req, res, async (err) => {
    console.log('여긴가?1');
    console.log(err);
    if (err) {
      console.log('여긴가?2');
      return res.status(400).render('boards/upload', {
        pageTitle: 'Upload Board',
        errorMsg: err.message,
      });
    }
    console.log('여긴가?3');
    console.log(err);
    try {
      console.log('Creating a new board...');
      const { files } = req;
      const createdBoard = await Board.create({
        title,
        content,
        fileUrl: files['file'][0].location,
        owner: _id,
      });
      console.log('Board created:', createdBoard);
      const user = await User.findById(_id);
      user.boards.push(createdBoard._id);
      await user.save();

      return res.redirect('/');
    } catch (err) {
      console.error('Error while creating board:', err);
      return res.status(400).render('boards/upload', {
        pageTitle: 'Upload Board',
        errorMsg: err.message,
      });
    }
  });
};

export const deleteBoard = async (req, res, next) => {
  const { id } = req.params;
  const board = await Board.findById(id); // 이 부분도 소문자로 변경
  if (!board) {
    return res.status(404).render('404', { pageTitle: 'board not found' });
  }

  if (board.owner.toString() !== req.session.user._id.toString()) {
    return res.status(403).redirect('/');
  }

  await Board.findByIdAndDelete(id); // 이 부분도 소문자로 변경

  return res.redirect('/');
};
