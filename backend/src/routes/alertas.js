const r = require('express').Router();
const c = require('../controllers/alertaController');
const { auth } = require('../middleware/auth');
r.get('/', auth, c.getAll);
r.post('/', auth, c.create);
r.patch('/:id/resolver', auth, c.resolver);
module.exports = r;
