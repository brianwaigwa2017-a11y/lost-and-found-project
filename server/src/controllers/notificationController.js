const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ notifications, unreadCount });
};

const markOneRead = async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  notification.isRead = true;
  await notification.save();
  res.json({ message: 'Notification marked as read' });
};

const markAllRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
};

module.exports = { getNotifications, markOneRead, markAllRead };
