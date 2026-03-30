const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Get token from the Authorization header
  // Header format: "Authorization: Bearer <token>"
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Check if token doesn't exist
  if (!token) {
    return res.status(401).json({ 
      error: "Access Denied. No token provided." 
    });
  }

  try {
    // 3. Verify the token using your secret key from .env
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach the user data (usually { id: ... }) to the request object
    req.user = verified;
    
    // 5. Move to the next function (the actual route logic)
    next();
  } catch (err) {
    res.status(403).json({ 
      error: "Invalid or Expired Token." 
    });
  }
};