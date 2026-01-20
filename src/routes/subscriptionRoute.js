const express = require('express');
const router = express.Router();
const subController = require('../controllers/subscriptionController');
const authenticate = require('../middleware/auth'); 

router.get('/news', subController.getNews);
router.post('/preview', authenticate, subController.previewSubscription);
router.post('/add', authenticate, subController.createSubscription);
router.get('/:userId', authenticate, subController.getUserSubscriptions);
router.delete('/:id', authenticate, subController.deleteSubscription);

module.exports = router;