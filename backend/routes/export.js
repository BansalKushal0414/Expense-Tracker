const router = require('express').Router();
const auth = require('../middleware/auth');
const exportController = require('../controllers/exportController');

router.get('/csv', auth, exportController.exportCSV);

module.exports = router;