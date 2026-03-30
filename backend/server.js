require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Import the centralized sequelize instance and models
const { sequelize } = require('./models'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Routes ---
// Note: The relationships are now handled inside ./models/index.js 
// so they don't need to be defined here anymore.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reports', require('./routes/reports')); 
app.use('/api/export', require('./routes/export'));
app.use('/api/budgets', require('./routes/budgets')); 

// --- Database Sync & Server Start ---
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