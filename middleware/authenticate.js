// middleware/auth.js
const db = require('../utils/db');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send('Unauthorized');

  const user = db.users.find(u => u.id === parseInt(token));
  if (!user) return res.status(401).send('Unauthorized');

  req.user = user;
  next();
};

module.exports = authenticate;
