const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Log = require('../models/Log');

const getDashboard = async (req, res) => {
  const [totalItems, pendingItems, approvedItems, claimedItems, pendingClaims, recentItems, recentClaims] = await Promise.all([
    Item.countDocuments(),
    Item.countDocuments({ status: 'pending' }),
    Item.countDocuments({ status: 'approved' }),
    Item.countDocuments({ status: { $in: ['claimed', 'returned'] } }),
    Claim.countDocuments({ status: 'pending' }),
    Item.find().sort({ createdAt: -1 }).limit(5).populate('reporter', 'name email'),
    Claim.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).populate('item', 'title').populate('claimant', 'name email'),
  ]);

  const returnedCount = await Item.countDocuments({ status: 'returned' });
  const recoveryRate = totalItems ? Math.round(((returnedCount + claimedItems) / totalItems) * 100) : 0;

  res.json({
    stats: {
      totalItems,
      pendingItems,
      approvedItems,
      claimedItems,
      pendingClaims,
      recoveryRate,
    },
    recentItems,
    recentClaims,
  });
};

const getUsers = async (req, res) => {
  const { search } = req.query;
  const query = search ? {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ],
  } : {};

  const users = await User.find(query).sort({ createdAt: -1 }).select('-password');
  res.json({ users });
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.role = role;
  await user.save();
  res.json({ message: 'User role updated' });
};

const toggleUserActive = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save();
  res.json({ message: `User ${user.isActive ? 'reactivated' : 'deactivated'}` });
};

const getLogs = async (req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 }).populate('user', 'name email').limit(100);
  res.json({ logs });
};

module.exports = { getDashboard, getUsers, updateUserRole, toggleUserActive, getLogs };
