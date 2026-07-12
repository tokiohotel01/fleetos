const r = require('express').Router();
const c = require('../controllers/finanzasController');
const { auth, authorize } = require('../middleware/auth');
r.get('/resumen', auth, c.resumenFinanciero);
r.get('/facturas', auth, c.getFacturas);
r.post('/facturas', auth, authorize('administrador','finanzas'), c.crearFactura);
r.patch('/facturas/:id/pago', auth, authorize('administrador','finanzas'), c.registrarPago);
module.exports = r;
