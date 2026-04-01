const { Budget, Category } = require('../models');

exports.setBudget = async (req, res) => {
  try {
    const { category, amount_limit, month, year } = req.body;

    const categoryRecord = await Category.findOne({
      where: { name: category, userId: req.user.id }
    });

    if (!categoryRecord) {
      return res.status(404).json({ error: `Category '${category}' does not exist. Please create it first.` });
    }

    let budget = await Budget.findOne({
      where: { userId: req.user.id, category, month, year }
    });

    if (budget) {

      budget.amount_limit = amount_limit;
      await budget.save();
    } else {

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
};

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({ where: { userId: req.user.id } });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};