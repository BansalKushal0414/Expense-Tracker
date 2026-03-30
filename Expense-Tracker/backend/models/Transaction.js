const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
  description: { type: DataTypes.STRING },
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
});

module.exports = Transaction;