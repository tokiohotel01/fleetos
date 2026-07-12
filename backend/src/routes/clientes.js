const r = require('express').Router();
const c = require('../controllers/clienteController');
const { auth, authorize } = require('../middleware/auth');
r.get('/', auth, c.getAll);
r.get('/:id', auth, c.getOne);
r.post('/', auth, authorize('administrador','logistica','finanzas'), c.create);
r.put('/:id', auth, authorize('administrador','logistica','finanzas'), c.update);
r.delete('/:id', auth, authorize('administrador'), c.remove);
module.exports = r;
