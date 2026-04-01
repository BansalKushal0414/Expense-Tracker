const router = require('express').Router();
const auth = require('../middleware/auth');
const categoriesController = require('../controllers/categoriesController');

router.get('/', auth, categoriesController.getCategories);
router.post('/', auth, categoriesController.addCategory);
router.delete('/:id', auth, categoriesController.deleteCategory);

module.exports = router;