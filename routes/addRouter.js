const express = require('express');
const router = express.Router();
const addController  = require('../controller/addcontroller');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });


router.get('/', (req, res) => {
  if(!req.session.isLoggedIn){
    return res.redirect('/login');
  }
  else{
    res.render('add', { pageTitle: "Add Car",  activePage: "add" , isLoggedIn: req.session.isLoggedIn });
  }
});
router.post('/', upload.single('image'), addController.addpost);

module.exports = router;
