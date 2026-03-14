const express = require('express');
const multer = require('multer');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  listMarketers,
  createMarketer,
  updateMarketer,
  deleteMarketer,
  getAnalytics,
  updateLandingContent,
  uploadHeroImage,
  uploadLogoImage,
} = require('../controllers/adminController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/marketers', listMarketers);
router.post('/marketers', createMarketer);
router.put('/marketers/:id', updateMarketer);
router.delete('/marketers/:id', deleteMarketer);
router.get('/analytics', getAnalytics);
router.put('/content', updateLandingContent);
router.post('/upload-hero', upload.single('image'), uploadHeroImage);
router.post('/upload-logo', upload.single('image'), uploadLogoImage);

module.exports = router;
