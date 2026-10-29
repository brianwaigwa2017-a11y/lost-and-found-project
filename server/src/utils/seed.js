require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Claim = require('../models/Claim');
const Log = require('../models/Log');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lostandfound');

    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Notification.deleteMany({}),
      Claim.deleteMany({}),
      Log.deleteMany({}),
    ]);

    const admin = await User.create({
      name: 'School Admin',
      email: 'admin@school.ac.ke',
      password: 'Admin123!',
      role: 'admin',
      studentId: 'ADMIN-01',
      isActive: true,
    });

    const student = await User.create({
      name: 'Jane Student',
      email: 'student@school.ac.ke',
      password: 'Password123!',
      role: 'student',
      studentId: 'STU-101',
      isActive: true,
    });

    const foundItem = await Item.create({
      title: 'Black Wallet',
      description: 'Black leather wallet with a small keychain and student ID slot.',
      category: 'wallets',
      type: 'found',
      location: 'Main Library',
      date: new Date('2026-09-06'),
      reporter: student._id,
      status: 'approved',
    });

    const lostItem = await Item.create({
      title: 'Blue Backpack',
      description: 'Blue backpack with a red zipper and a calculator inside.',
      category: 'bags',
      type: 'lost',
      location: 'Science Block',
      date: new Date('2026-09-09'),
      reporter: admin._id,
      status: 'approved',
    });

    await Notification.create({
      user: student._id,
      message: 'A found item matching your report was posted in the system.',
      context: { type: 'match', itemId: foundItem._id },
      isRead: false,
    });

    await Log.create({
      user: admin._id,
      action: 'seed_data',
      details: 'Initial data seeded for the school lost & found system.',
      ip: '127.0.0.1',
    });

    console.log('Seed complete. Admin login: admin@school.ac.ke / Admin123!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
