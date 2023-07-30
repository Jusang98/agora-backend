import Image from '../models/Image';
import User from '../models/User';

export const watch = async (req, res, next) => {
  const { id } = req.params;
  const image = await Image.findById(id).populate('owner');

  if (image === null) {
    return res.status(404).render('404', { pageTitle: 'Image not found' });
  }
  return res.render('images/watch', { pageTitle: image.title, image });
};

export const upload = (req, res, next) => {
  return res.render('images/upload', { pageTitle: 'Upload' });
};

export const postImageUpload = async (req, res, next) => {
  const {
    session: {
      user: { _id },
    },
    body: { title, content },
    file,
  } = req;
  try {
    const createdImage = await Image.create({
      title,
      content,
      fileUrl: file.path,
      owner: _id,
    });
    const user = await User.findById(_id);
    user.images.push(createdImage);
    await user.save();

    return res.redirect('/');
  } catch (err) {
    return res.status(400).render('images/upload', {
      pageTitle: 'Upload Image',
      errorMsg: err._message,
    });
  }
};

export const deleteImage = async (req, res, next) => {
  const { id } = req.params;
  const image = await Image.findById(id);
  if (!image) {
    return res.status(404).render('404', { pageTitle: 'Image not found' });
  }

  if (image.owner.toString() !== req.session.user._id.toString()) {
    return res.status(403).redirect('/');
  }

  await Image.findByIdAndDelete(id);

  return res.redirect('/');
};

/*------------------ Controllers for API ROUTER ------------------*/
export const registerImageView = async (req, res, next) => {
  const { id } = req.params;
  const image = await Image.findById(id);
  if (!image) {
    return res.sendStatus(404);
  }
  image.meta.views = image.meta.views + 1;
  await image.save();
  return res.sendStatus(200);
};

export const registerImageLike = async (req, res, next) => {
  const { id } = req.params;
  const image = await Video.findById(id);
  if (!image) {
    return res.sendStatus(404);
  }
  image.meta.likes = image.meta.likes + 1;
  await image.save();
  return res.sendStatus(200);
};
/*--------------------------------------------------------------- */
