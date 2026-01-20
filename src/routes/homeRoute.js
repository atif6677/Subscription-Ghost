const express = require('express');
const path = require('path');
const router = express.Router();

// Serve Home Page
router.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/home.html'));
});

// Fallback Route (The "Catch All")

router.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/login.html'));
});

module.exports = router;