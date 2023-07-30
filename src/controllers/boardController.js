import { s3Upload } from '../../util/s3';
import Board from '../models/Board';
import User from '../models/User';

export const watch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id).populate('owner');

    if (!board) {
      return res.status(404).render('404', { pageTitle: 'board not found' });
    }
    return res.render('boards/watch', { pageTitle: board.title, board });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

export const getBoard = (req, res) => {
  return res.render('boards/upload', { pageTitle: 'Upload' });
};

export const postBoardCreate = async (req, res, next) => {
  console.log(req.body, req.files);
  s3Upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ success: false, errorMsg: err.message });
    }

    try {
      const { files } = req;
      const fileUrl = files['file'][0].location;

      const {
        session: {
          user: { _id },
        },
        body: { title, content },
      } = req;

      const createdBoard = await Board.create({
        title,
        content,
        fileUrl,
        owner: _id,
      });

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
  });
};

export const deleteBoard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).render('404', { pageTitle: 'board not found' });
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
