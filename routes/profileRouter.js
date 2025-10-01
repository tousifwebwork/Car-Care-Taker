const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');

// GET profile page
router.get('/', profileController.profileget);

module.exports = router;
