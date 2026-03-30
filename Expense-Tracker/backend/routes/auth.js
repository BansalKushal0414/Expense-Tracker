const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed });
    res.status(201).json({ message: "User registered" });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;