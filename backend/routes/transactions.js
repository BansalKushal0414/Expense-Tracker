const router = require('express').Router();
const auth = require('../middleware/auth');
const transactionsController = require('../controllers/transactionsController');

router.post('/', auth, transactionsController.createTransaction);

router.get('/reports/summary', auth, transactionsController.getSummaryReport);

module.exports = router;