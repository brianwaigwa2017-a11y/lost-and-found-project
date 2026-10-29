
const { validationResult } = require('express-validator');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Log = require('../models/Log');
const { sendClaimConfirmationEmail } = require('../utils/email');

// Get claims for a specific item
const getClaimsForItem = async (req, res) => {
  try {
    const claims = await Claim.find({ item: req.params.id })
      .sort({ createdAt: -1 })
      .populate('claimant', 'name email')
      .populate('item', 'title reporter status');

    res.json({ claims });
  } catch (error) {
    console.error('Get item claims error:', error);
    res.status(500).json({ message: 'Unable to retrieve claims.' });
  }
};

// Get claims submitted by the logged-in user
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .sort({ createdAt: -1 })
      .populate('item', 'title reporter status');

    res.json({ claims });
  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({ message: 'Unable to retrieve your claims.' });
  }
};

// Submit a claim and email the claimant
const createClaim = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { itemId, email, message, proofDescription } = req.body;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (String(item.reporter) === String(req.user._id)) {
      return res.status(400).json({
        message: 'You cannot claim your own item',
      });
    }

    const existing = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: 'You have already submitted a claim for this item',
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      contactEmail: email,
      message,
      proofDescription,
      status: 'pending',
    });

    await Notification.create({
      user: item.reporter,
      message: `A new claim was submitted for your item "${item.title}".`,
      context: {
        itemId: item._id,
        claimId: claim._id,
        type: 'claim',
      },
    });

    await Log.create({
      user: req.user._id,
      action: 'submit_claim',
      details: `Claim submitted on item ${item.title}`,
      ip: req.ip,
    });

    const claimantName = req.user.name || 'Student';
    let emailSent = false;

    try {
      await sendClaimConfirmationEmail(
        email,
        claimantName,
        item.title
      );

      emailSent = true;
      console.log(`Claim confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error(
        'Claim saved, but confirmation email failed:',
        emailError.message
      );
    }

    return res.status(201).json({
      message: emailSent
        ? 'Claim submitted successfully. Your claim is pending review.'
        : 'Your claim was submitted, but the confirmation email could not be sent. Please contact the school lost and found team.',
      emailSent,
      claim,
    });
  } catch (error) {
    console.error('Create claim error:', error);

    return res.status(500).json({
      message: 'Unable to submit claim. Please try again.',
    });
  }
};

// Withdraw a claim
const withdrawClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (
      String(claim.claimant) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'Not allowed to withdraw this claim',
      });
    }

    await claim.deleteOne();

    return res.json({ message: 'Claim withdrawn' });
  } catch (error) {
    console.error('Withdraw claim error:', error);
    return res.status(500).json({ message: 'Unable to withdraw claim.' });
  }
};

// Approve or reject a claim
const verifyClaim = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid claim status' });
    }

    const claim = await Claim.findById(req.params.id)
      .populate('claimant')
      .populate('item');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (!claim.claimant || !claim.item) {
      return res.status(400).json({
        message: 'The claim is missing its claimant or item.',
      });
    }

    claim.status = status;
    claim.adminNotes = adminNotes || '';

    await claim.save();

    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.item._id, {
        status: 'claimed',
      });

      await Notification.create({
        user: claim.claimant._id,
        message: `Your claim for "${claim.item.title}" was approved by the admin team.`,
        context: {
          itemId: claim.item._id,
          type: 'claim_approved',
        },
      });
    }

    if (status === 'rejected') {
      await Notification.create({
        user: claim.claimant._id,
        message: `Your claim for "${claim.item.title}" was rejected. Please contact the admin desk for more information.`,
        context: {
          itemId: claim.item._id,
          type: 'claim_rejected',
        },
      });
    }

    await Log.create({
      user: req.user._id,
      action: 'verify_claim',
      details: `Claim for ${claim.item.title} set to ${status}`,
      ip: req.ip,
    });

    return res.json({ message: 'Claim verification updated' });
  } catch (error) {
    console.error('Verify claim error:', error);
    return res.status(500).json({
      message: 'Unable to update claim verification.',
    });
  }
};

// Get all claims for administrators and staff
const getAdminClaims = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const claims = await Claim.find(query)
      .sort({ createdAt: -1 })
      .populate('item', 'title reporter status')
      .populate('claimant', 'name email studentId');

    res.json({ claims });
  } catch (error) {
    console.error('Get admin claims error:', error);
    res.status(500).json({ message: 'Unable to retrieve claims.' });
  }
};

module.exports = {
  getClaimsForItem,
  getMyClaims,
  createClaim,
  withdrawClaim,
  verifyClaim,
  getAdminClaims,
};
