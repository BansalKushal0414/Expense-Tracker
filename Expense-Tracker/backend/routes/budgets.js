const router = require('express').Router();
const { Budget } = require('../models');
const auth = require('../middleware/auth');

// Set or Update a budget
router.post('/', auth, async (req, res) => {
  try {
    const { category, amount_limit, month, year } = req.body;
    
    // Check if a budget already exists for this category/month/year
    let budget = await Budget.findOne({
      where: { userId: req.user.id, category, month, year }
    });

    if (budget) {
      // Update existing budget
      budget.amount_limit = amount_limit;
      await budget.save();
    } else {
      // Create new budget
      budget = await Budget.create({
        category,
        amount_limit,
        month,
        year,
        userId: req.user.id
      });
    }

    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all budgets for the user
router.get('/', auth, async (req, res) => {
  const budgets = await Budget.findAll({ where: { userId: req.user.id } });
  res.json(budgets);
});

module.exports = router;