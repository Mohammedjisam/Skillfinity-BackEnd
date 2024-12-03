const express = require('express');
const router = express.Router();
const { googleAuthStudent, googleAuthTutor } = require('../../controller/authController'); 

router.post('/google/student', googleAuthStudent);
router.post('/google/tutor', googleAuthTutor);

module.exports = router;