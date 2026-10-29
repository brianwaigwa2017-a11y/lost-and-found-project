const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDashboard, getUsers, updateUserRole, toggleUserActive, getLogs } = require('../controllers/adminController');
const { getAdminItems } = require('../controllers/itemController');
const { getAdminClaims } = require('../controllers/claimController');

const router = express.Router();

router.use(protect, authorize('admin', 'staff'));

router.get('/dashboard', getDashboard);
router.get('/items', getAdminItems);
router.get('/claims', getAdminClaims);
router.get('/users', getUsers);
router.get('/logs', getLogs);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-active', toggleUserActive);

module.exports = router;
