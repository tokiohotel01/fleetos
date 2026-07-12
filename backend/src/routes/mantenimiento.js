const r = require('express').Router();
const c = require('../controllers/mantenimientoController');
const { auth, authorize } = require('../middleware/auth');
r.get('/', auth, c.getAll);
r.get('/:id', auth, c.getOne);
r.post('/', auth, authorize('administrador','logistica'), c.create);
r.put('/:id', auth, authorize('administrador','logistica'), c.update);
module.exports = r;
