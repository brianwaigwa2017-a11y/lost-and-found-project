const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const Log = require('../models/Log');

const buildQuery = (filters = {}) => {
  const { search, category, type, status } = filters;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (type) query.type = type;
  if (status) query.status = status;

  return query;
};

const normalizeItem = (item) => ({
  ...item.toObject(),
  image: item.image ? `${process.env.BASE_URL || 'http://localhost:5000'}${item.image}` : '',
});

const getDashboard = async (req, res) => {
  const [totalItems, pendingItems, approvedItems, claimedItems, pendingClaims, recentItems, recentClaims] = await Promise.all([
    Item.countDocuments(),
    Item.countDocuments({ status: 'pending' }),
    Item.countDocuments({ status: 'approved' }),
    Item.countDocuments({ status: { $in: ['claimed', 'returned'] } }),
    Claim.countDocuments({ status: 'pending' }),
    Item.find().sort({ createdAt: -1 }).limit(5).populate('reporter', 'name email'),
    Claim.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).populate('item').populate('claimant', 'name email'),
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
    recentItems: recentItems.map(normalizeItem),
    recentClaims,
  });
};

const getItems = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const query = buildQuery(req.query);
  const total = await Item.countDocuments(query);
  const items = await Item.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('reporter', 'name email');

  res.json({
    items: items.map(normalizeItem),
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  });
};

const getMyItems = async (req, res) => {
  const items = await Item.find({ reporter: req.user._id }).sort({ createdAt: -1 }).populate('reporter', 'name email');
  res.json({ items: items.map(normalizeItem) });
};

const getItemById = async (req, res) => {
  const item = await Item.findById(req.params.id).populate('reporter', 'name email role studentId');
  if (!item) return res.status(404).json({ message: 'Item not found' });

  const matches = await Item.find({
    _id: { $ne: item._id },
    type: item.type === 'lost' ? 'found' : 'lost',
    category: item.category,
    status: 'approved',
    $or: [
      { location: { $regex: item.location.split(' ')[0], $options: 'i' } },
      { description: { $regex: item.title.split(' ')[0], $options: 'i' } },
    ],
  }).limit(4).populate('reporter', 'name');

  res.json({ item: normalizeItem(item), matches: matches.map(normalizeItem) });
};

const createItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

  const item = await Item.create({
    ...req.body,
    reporter: req.user._id,
    image: req.file ? `/uploads/${req.file.filename}` : '',
    status: 'pending',
  });

  await Notification.create({
    user: req.user._id,
    message: 'Your item report has been submitted and is awaiting review.',
    context: { itemId: item._id },
  });

  await Log.create({
    user: req.user._id,
    action: 'report_item',
    details: `Reported item: ${item.title}`,
    ip: req.ip,
  });

  res.status(201).json({ item: normalizeItem(item) });
};

const updateItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (String(item.reporter) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed to edit this item' });
  }

  const updates = req.body;
  if (req.file) {
    if (item.image) {
      const oldPath = path.join(__dirname, '../../', item.image.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    updates.image = `/uploads/${req.file.filename}`;
  }

  Object.assign(item, updates);
  await item.save();

  res.json({ item: normalizeItem(item) });
};

const deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (String(item.reporter) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed to delete this item' });
  }

  if (item.image) {
    const filePath = path.join(__dirname, '../../', item.image.replace(/^\//, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await Claim.deleteMany({ item: item._id });
  await Notification.deleteMany({ 'context.itemId': item._id });
  await item.deleteOne();

  res.json({ message: 'Item deleted successfully' });
};

const moderateItemStatus = async (req, res) => {
  const { status, adminNotes } = req.body;
  const item = await Item.findById(req.params.id).populate('reporter', 'name email');
  if (!item) return res.status(404).json({ message: 'Item not found' });

  item.status = status;
  item.adminNotes = adminNotes || item.adminNotes || '';
  await item.save();

  if (status === 'approved') {
    await Notification.create({
      user: item.reporter._id,
      message: `Your item report "${item.title}" has been approved.`,
      context: { itemId: item._id, type: 'approval' },
    });
  }

  if (status === 'rejected') {
    await Notification.create({
      user: item.reporter._id,
      message: `Your item report "${item.title}" was rejected. Please review the notes and resubmit if needed.`,
      context: { itemId: item._id, type: 'rejection' },
    });
  }

  await Log.create({
    user: req.user._id,
    action: 'moderate_item',
    details: `Set item ${item.title} status to ${status}`,
    ip: req.ip,
  });

  res.json({ message: 'Item status updated' });
};

const getAdminItems = async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const items = await Item.find(query).sort({ createdAt: -1 }).populate('reporter', 'name email');
  res.json({ items: items.map(normalizeItem) });
};

module.exports = {
  getDashboard,
  getItems,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  moderateItemStatus,
  getAdminItems,
};
