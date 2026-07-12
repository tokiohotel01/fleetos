const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.activo) return res.status(401).json({ success: false, message: 'Token inválido' });
    req.user = user;
    next();
  } catch (e) { res.status(401).json({ success: false, message: 'Token inválido o expirado' }); }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol))
    return res.status(403).json({ success: false, message: 'Sin permisos para esta acción' });
  next();
};

module.exports = { auth, authorize };
