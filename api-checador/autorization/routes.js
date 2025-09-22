const router = require("express").Router();
const AutorizationCTRL = require("./controllers/autorization_ctrl");


router.get("/signup", AutorizationCTRL.signup);

module.exports = router;