const r = require('express').Router();
const c = require('../controllers/reporteController');
const { auth, authorize } = require('../middleware/auth');
r.get('/rentabilidad-cliente', auth, c.rentabilidadPorCliente);
r.get('/rentabilidad-unidad', auth, c.rentabilidadPorUnidad);
r.get('/kpi', auth, c.kpiLogisticos);
module.exports = r;
