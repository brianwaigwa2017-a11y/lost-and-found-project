const express = require('express');
const { body } = require('express-validator');
const upload = require('../utils/upload');
const { protect, authorize } = require('../middleware/auth');
const { getItems, getMyItems, getItemById, createItem, updateItem, deleteItem, moderateItemStatus } = require('../controllers/itemController');

const router = express.Router();

router.get('/', getItems);
router.get('/mine', protect, getMyItems);
router.get('/:id', getItemById);

router.post('/', protect, upload.single('image'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['electronics', 'identification', 'books', 'bags', 'wallets', 'keys', 'clothing', 'documents', 'other']).withMessage('Invalid category'),
  body('type').isIn(['lost', 'found']).withMessage('Type must be lost or found'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
], createItem);

router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);
router.put('/:id/status', protect, authorize('admin', 'staff'), moderateItemStatus);

module.exports = router;
