const express = require('express');
const router = express.Router();
const termsConditionGet = require('../controller/termsConditionController');

router.get('/', termsConditionGet.termsConditionGet);

module.exports = router;