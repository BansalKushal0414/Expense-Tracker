require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reports', require('./routes/reports')); 
app.use('/api/export', require('./routes/export'));
app.use('/api/budgets', require('./routes/budgets')); 
const PORT = process.env.PORT || 5000;

try {
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('Database Connected & Synced');
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
} catch (e) {
  console.error("Critical Server Startup Error:", e);
}