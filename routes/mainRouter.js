const express = require("express");
const router = express.Router();
const mainController = require("../controller/maincontroller");
const deleteController = require("../controller/deleteController");

router.get("/", mainController.mainget);
router.get("/dashboard", mainController.dashboardget);
router.delete("/delete/:id", deleteController.deleteCar);

module.exports = router;
