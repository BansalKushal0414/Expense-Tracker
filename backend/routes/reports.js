const router = require('express').Router();
const auth = require('../middleware/auth');
const reportsController = require('../controllers/reportsController');

router.get('/charts/pie', auth, reportsController.getPieChart);

router.get('/monthly-summary', auth, reportsController.getMonthlySummary);

module.exports = router;