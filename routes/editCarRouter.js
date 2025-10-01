const express = require("express");
const router = express.Router();
const editCarController = require("../controller/editCarController");

// GET - Edit car page
router.get("/:id", editCarController.getEditCar);

// POST - Update car details
router.post(
  "/:id",
  editCarController.uploadCarImage,
  editCarController.postEditCar
);

module.exports = router;
