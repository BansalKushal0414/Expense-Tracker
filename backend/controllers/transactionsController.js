const { Transaction, Category } = require('../models'); // Adjust path based on your setup
const { Op, fn, col } = require('sequelize');
const Budget = require('../models/Budget');

exports.createTransaction = async (req, res) => {
  try {
    const { amount, category, type, date, description } = req.body;

    const categoryRecord = await Category.findOne({
      where: { name: category, type, userId: req.user.id }
    });

    if (!categoryRecord) {
      return res.status(404).json({ error: `Category '${category}' of type '${type}' does not exist. Please create it first.` });
    }

    const tx = await Transaction.create({ 
      amount, 
      category, 
      type, 
      date, 
      description, 
      userId: req.user.id,
      categoryId: categoryRecord.id 
    });

    let alert = null;

    if (type === 'expense') {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const budget = await Budget.findOne({
        where: { userId: req.user.id, category, month: currentMonth, year: currentYear }
      });

      if (budget) {

        const totalSpent = await Transaction.sum('amount', {
          where: {
            userId: req.user.id,
            category,
            type: 'expense',
            date: {
              [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
              [Op.lte]: new Date(currentYear, currentMonth, 0)
            }
          }
        });

        if (totalSpent > budget.amount_limit) {
          alert = `Warning: You have exceeded your ${category} budget of ${budget.amount_limit}! Total spent: ${totalSpent}`;
        }
      }
    }

    res.json({ transaction: tx, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSummaryReport = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30; // Default to monthly (30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const report = await Transaction.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.gte]: startDate // "Greater than or equal to" start date
        }
      },
      attributes: [
        'type',
        'category',
        [fn('SUM', col('amount')), 'total_amount'],
        [fn('COUNT', col('id')), 'transaction_count']
      ],
      group: ['type', 'category'],
      order: [[fn('SUM', col('amount')), 'DESC']]
    });

    const totalIncome = report
      .filter(r => r.type === 'income')
      .reduce((acc, curr) => acc + parseFloat(curr.dataValues.total_amount), 0);

    const totalExpense = report
      .filter(r => r.type === 'expense')
      .reduce((acc, curr) => acc + parseFloat(curr.dataValues.total_amount), 0);

    res.json({
      period_days: days,
      summary: report,
      totals: {
        income: totalIncome,
        expense: totalExpense,
        net_savings: totalIncome - totalExpense
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};