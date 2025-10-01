const express = require('express');
const router = express.Router();
const editController = require('../controller/editController');

// GET edit profile
router.get('/', editController.getEditProfile);

// POST edit profile with image upload
router.post('/', editController.uploadProfileImage, editController.postEditProfile);

module.exports = router;
