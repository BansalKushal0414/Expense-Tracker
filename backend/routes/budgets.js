const router = require('express').Router();
const auth = require('../middleware/auth');
const budgetsController = require('../controllers/budgetsController');

router.post('/', auth, budgetsController.setBudget);
router.get('/', auth, budgetsController.getBudgets);

module.exports = router;