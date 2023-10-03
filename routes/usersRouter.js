// server/routes/videos.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('users/sign_in', usersController.sign_in);

router.post('webhooks/user', usersController.webhookHandler);

module.exports = router;
