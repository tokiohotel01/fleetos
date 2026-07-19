const r = require('express').Router();
const c = require('../controllers/authController');
const { auth } = require('../middleware/auth');
r.post('/login', c.login);
r.get('/me', auth, c.me);
r.put('/change-password', auth, c.changePassword);
r.post('/setup', async (req, res) => { try {
    const User = require('../models/User');
    const existe = await User.findOne({ email: 'admin@fleetos.com' });
    if (existe) return res.json({ message: 'Ya existe' });
    await User.create({ nombre: 'Administrador', email: 'admin@fleetos.com', password: 'admin123', rol: 'administrador' });
    res.json({ message: 'Usuario creado OK' });
        } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = r;
