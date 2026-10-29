const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactEmail: { type: String, trim: true, lowercase: true, default: '' },
  message: { type: String, required: true, trim: true, maxlength: 1500 },
  proofDescription: { type: String, required: true, trim: true, maxlength: 1500 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Claim', claimSchema);
