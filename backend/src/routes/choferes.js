const r = require('express').Router();
const c = require('../controllers/choferController');
const { auth, authorize } = require('../middleware/auth');
r.get('/', auth, c.getAll);
r.get('/:id', auth, c.getOne);
r.post('/', auth, authorize('administrador','logistica','rrhh'), c.create);
r.put('/:id', auth, authorize('administrador','logistica','rrhh'), c.update);
r.post('/:id/sanciones', auth, authorize('administrador','rrhh'), c.addSancion);
module.exports = r;
