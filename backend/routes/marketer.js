const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { getProfile, updateWhatsApp, getStats } = require('../controllers/marketerController');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('marketer'));

router.get('/profile', getProfile);
router.put('/update-number', updateWhatsApp);
router.get('/stats', getStats);

module.exports = router;
