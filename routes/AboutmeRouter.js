const express = require('express');
const router = express.Router();
const aboutmeController = require('../controller/AboutmeController');

router.get('/', aboutmeController.aboutget);

module.exports = router;