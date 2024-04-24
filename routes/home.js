const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', function(req, res, next) {
  // Send the home.html file located in the views directory
  res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
});

module.exports = router;
