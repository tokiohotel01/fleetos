const jwt = require('jsonwebtoken');
const User = require('../models/User');
const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    if (!user.activo) return res.status(401).json({ success: false, message: 'Usuario inactivo' });
    user.ultimoAcceso = new Date(); await user.save();
    res.json({ success: true, token: genToken(user._id), user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.me = async (req, res) => res.json({ success: true, user: req.user });
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(req.body.passwordActual)))
      return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
    user.password = req.body.passwordNueva; await user.save();
    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
