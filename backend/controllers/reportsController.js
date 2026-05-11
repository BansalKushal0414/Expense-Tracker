const { Transaction } = require('../models'); 
const { fn, col, Op } = require('sequelize');


exports.getMonthlySummary = async (req, res) => {
  try {
    const now = new Date();

    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

    const summary = await Transaction.findAll({
      where: {
        userId: req.user.id,
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [
        'type',
        [fn('SUM', col('amount')), 'total']
      ],
      group: ['type']
    });

    const result = {
      income: 0,
      expense: 0,
      balance: 0
    };

    summary.forEach(item => {
      const type = item.type; // 'income' or 'expense'
      const total = parseFloat(item.getDataValue('total'));
      result[type] = total;
    });

    result.balance = result.income - result.expense;

    res.json({
      month: now.toLocaleString('default', { month: 'long' }),
      data: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};