const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ error: 'Access token missing' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Authenticated user payload:', payload);
    
    req.user = {
      id: payload.sub,
      role: payload.role,
      department: payload.department,
      branch: payload.branch
    };

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };
