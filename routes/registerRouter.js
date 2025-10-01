const express = require("express");
const router = express.Router();
const RegisterRouter = require("../controller/registerController");

router.get("/", RegisterRouter.getRegister);
router.post(
  "/",
  RegisterRouter.registerValidation,
  RegisterRouter.postRegister
);

module.exports = router;
