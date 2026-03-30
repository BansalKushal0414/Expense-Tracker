const router = require('express').Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Get all categories for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { userId: req.user.id } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new category
router.post('/', auth, async (req, res) => {
  try {
    const { name, type } = req.body; // type: 'income' or 'expense'

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      where: { name, type, userId: req.user.id }
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = await Category.create({ 
      name, 
      type, 
      userId: req.user.id 
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a category
router.delete('/:id', auth, async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;