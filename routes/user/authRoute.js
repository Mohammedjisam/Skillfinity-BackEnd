// authRoute.js
const express = require('express');
const router = express.Router();
const { googleAuth } = require('../../controller/authController'); 

router.post("/google", googleAuth);
module.exports = router;