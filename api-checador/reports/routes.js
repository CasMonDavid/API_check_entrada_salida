const multer  = require('multer');
const router = require("express").Router();
const ReportsCTRL = require("./controllers/reports_ctrl");

const upload = multer({ dest: '../uploads/' });

router.post("/create", upload.single('report'), ReportsCTRL.create);

module.exports = router;