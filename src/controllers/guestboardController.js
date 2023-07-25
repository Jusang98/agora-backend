import GuestBoard from "../models/GuestBoard";
import User from "../models/User";

export const uploadGuestBoard = async (req, res, next) => {
  try {
    const { guestboard_title, guestboard_content, guestboard_date } = req.body;
    const guestboard = await GuestBoard.create({
      user_uid: req.params.id,
      guestboard_title,
      guestboard_content,
      guestboard_date,
    });
    res.status(201).json(guestboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateGuestBoard = async (req, res, next) => {
  try {
    const guestboard = await GuestBoard.findOne({
      where: {
        user_uid: req.params.id,
      },
    });

    const updatedGuestboard = await guestboard.update(req.body);
    return res.status(201).json(updatedGuestboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGuestBoard = async (req, res, next) => {
  try {
    const guestboard = await GuestBoard.findByPk(req.params.id);
    if (guestboard.user_uid !== req.user.id) {
      return res.status(403).json({ error: "내 게시물만 삭제할 수 있습니다." });
    }
    await GuestBoard.destroy();
    res.json({ message: "GuestBoard deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
