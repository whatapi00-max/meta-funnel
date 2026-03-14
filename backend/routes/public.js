const express = require('express');
const { getMarketerByRef, trackClick, getLandingContent } = require('../controllers/publicController');

const router = express.Router();

router.get('/marketer/:ref', getMarketerByRef);
router.post('/click/:ref', trackClick);
router.get('/content', getLandingContent);

module.exports = router;
