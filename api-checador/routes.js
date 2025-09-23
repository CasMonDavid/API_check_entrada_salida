const express = require('express');
const router = express.Router();

router.use('/autorization', require('./autorization/routes'));
router.use('/report', require('./reports/routes'));

module.exports = router;