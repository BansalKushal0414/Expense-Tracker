const sequelize = require('../config/db');
const User = require('./User');
const Transaction = require('./Transaction');
const Category = require('./Category');
const Budget = require('./Budget');

// --- Define Relationships ---

// User <-> Transaction
User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

// User <-> Category
User.hasMany(Category, { foreignKey: 'userId', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'userId' });

// User <-> Budget
User.hasMany(Budget, { foreignKey: 'userId', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId' });

// Transaction <-> Category
Category.hasMany(Transaction, { foreignKey: 'categoryId' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = {
  sequelize,
  User,
  Transaction,
  Category,
  Budget
};