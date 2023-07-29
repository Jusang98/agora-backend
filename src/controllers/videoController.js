import Video from "../models/Video";
import User from "../models/User";

export const home = async (req, res, next) => {
  try {
    const users = await Video.find({});

    return res.render("home", { pageTitle: "Home", users }); // pug에 변수 보내주기
  } catch {
    return res.end();
  }
};

export const watch = async (req, res, next) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner"); //연결된owner를 통해 owner의 데이터를 User모델에서 찾아서 가지고옴.

  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  return res.render("videos/watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res, next) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (video.owner.toString() !== req.session.user._id.toString()) {
    return res.status(403).redirect("/");
  }

  return res.render("videos/edit-video", {
    pageTitle: `Editing ${video.title}`,
    video,
  });
};

export const postEdit = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id }); //몽고db의 id(==_id)와 파라미터로 받은 id(==id)가 일치하는지 확인
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (video.owner.toString() !== req.session.user._id.toString()) {
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  return res.redirect("/");
};

export const deleteVideo = async (req, res, next) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (video.owner.toString() !== req.session.user._id.toString()) {
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id);

  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"), //대소문자 구분없이 keyword를 포함하고있으면 모두 검색(몽고DB 기능))
      },
    });
  }

  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res, next) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const upload = (req, res, next) => {
  return res.render("videos/upload", { pageTitle: "Upload" });
};

export const postVideoUpload = async (req, res, next) => {
  const {
    session: {
      user: { _id },
    },
    body: { title },
    file,
  } = req;
  try {
    const createdVideo = await Video.create({
      title,
      fileUrl: file.path,
      owner: _id,
    });
    const user = await User.findById(_id);
    user.videos.push(createdVideo);
    await user.save();

    return res.redirect("/");
  } catch (err) {
    return res.status(400).render("videos/upload", {
      pageTitle: "Upload Video",
      errorMsg: err._message,
    });
  }
};
