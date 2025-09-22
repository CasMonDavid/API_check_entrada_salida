const express = require('express');
const router = express.Router();

router.use('/autorization', require('./autorization/routes'));

module.exports = router;