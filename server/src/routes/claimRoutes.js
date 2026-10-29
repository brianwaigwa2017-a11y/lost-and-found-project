const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { getClaimsForItem, getMyClaims, createClaim, withdrawClaim, verifyClaim } = require('../controllers/claimController');

const router = express.Router();

router.get('/item/:id', protect, getClaimsForItem);
router.get('/mine', protect, getMyClaims);
router.post('/', protect, [
  body('itemId').notEmpty().withMessage('Item ID is required'),
  body('email').trim().isEmail().withMessage('A valid email address is required'),
  body('message').trim().notEmpty().withMessage('Claim message is required'),
  body('proofDescription').trim().notEmpty().withMessage('Proof description is required'),
], createClaim);
router.delete('/:id', protect, withdrawClaim);
router.put('/:id/verify', protect, authorize('admin', 'staff'), verifyClaim);

module.exports = router;
