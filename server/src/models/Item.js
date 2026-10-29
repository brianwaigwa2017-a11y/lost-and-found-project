const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: {
    type: String,
    enum: ['electronics', 'identification', 'books', 'bags', 'wallets', 'keys', 'clothing', 'documents', 'other'],
    default: 'other',
  },
  type: { type: String, enum: ['lost', 'found'], required: true },
  location: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  image: { type: String, default: '' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'claimed', 'returned'], default: 'pending' },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Item', itemSchema);
