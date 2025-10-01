const express = require('express');
const router = express.Router();
const myprojectController = require('../controller/myprojectController');

router.get('/', myprojectController.myprojectget);

module.exports = router;