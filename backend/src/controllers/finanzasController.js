const Factura = require('../models/Factura');
const Cliente = require('../models/Cliente');

exports.getFacturas = async (req, res) => {
  try {
    const { estado, cliente, page = 1, limit = 20 } = req.query;
    const q = {};
    if (estado) q.estado = estado;
    if (cliente) q.cliente = cliente;
    const total = await Factura.countDocuments(q);
    const data = await Factura.find(q).populate('cliente','razonSocial cuit').sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    res.json({ success: true, data, total, page: Number(page), pages: Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.crearFactura = async (req, res) => {
  try {
    const factura = await Factura.create({ ...req.body, creadoPor: req.user._id });
    await Cliente.findByIdAndUpdate(req.body.cliente, { '$inc': { saldoCuentaCorriente: factura.total } });
    res.status(201).json({ success: true, data: factura });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.registrarPago = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id);
    if (!factura) return res.status(404).json({ success: false, message: 'No encontrada' });
    factura.estado = 'pagada'; await factura.save();
    await Cliente.findByIdAndUpdate(factura.cliente, { '$inc': { saldoCuentaCorriente: -factura.total } });
    res.json({ success: true, data: factura });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.resumenFinanciero = async (req, res) => {
  try {
    const hoy = new Date();
    const ini = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const [emitidas, pagadas, vencidas] = await Promise.all([
      Factura.aggregate([{ '$match': { createdAt: { '$gte': ini }, estado: { '$ne': 'anulada' } } }, { '$group': { _id: null, total: { '$sum': '$total' }, count: { '$sum': 1 } } }]),
      Factura.aggregate([{ '$match': { createdAt: { '$gte': ini }, estado: 'pagada' } }, { '$group': { _id: null, total: { '$sum': '$total' } } }]),
      Factura.countDocuments({ estado: 'vencida' })
    ]);
    res.json({ success: true, data: { ingresosMes: emitidas[0]?.total || 0, facturasMes: emitidas[0]?.count || 0, cobradoMes: pagadas[0]?.total || 0, facturasMorosas: vencidas } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
