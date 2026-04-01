const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');

exports.exportCSV = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ 
      where: { userId: req.user.id },
      attributes: ['date', 'category', 'type', 'amount', 'description'],
      order: [['date', 'DESC']]
    });

    const data = transactions.map(t => ({
      Date: t.date,
      Category: t.category,
      Type: t.type,
      Amount: t.amount,
      Description: t.description
    }));

    if (data.length === 0) {
      return res.status(404).json({ message: "No data available to export" });
    }

    const fields = ['Date', 'Category', 'Type', 'Amount', 'Description'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error during export");
  }
};