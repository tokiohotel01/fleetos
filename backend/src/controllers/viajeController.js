const Viaje = require('../models/Viaje');
const Flota = require('../models/Flota');
const Chofer = require('../models/Chofer');

exports.getAll = async (req, res) => {
  try {
    const { estado, cliente, chofer, search, page = 1, limit = 20 } = req.query;
    const q = {};
    if (estado) q.estado = estado;
    if (cliente) q.cliente = cliente;
    if (chofer) q.chofer = chofer;
    if (search) q.numero = new RegExp(search,'i');
    const total = await Viaje.countDocuments(q);
    const data = await Viaje.find(q)
      .populate('cliente','razonSocial')
      .populate('vehiculo','patente marca modelo')
      .populate('chofer','nombre apellido')
      .sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    res.json({ success: true, data, total, page: Number(page), pages: Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.getOne = async (req, res) => {
  try {
    const data = await Viaje.findById(req.params.id)
      .populate('cliente').populate('vehiculo').populate('semirremolque').populate('chofer');
    if (!data) return res.status(404).json({ success: false, message: 'Viaje no encontrado' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.create = async (req, res) => {
  try {
    const viaje = await Viaje.create({ ...req.body, creadoPor: req.user._id });
    await Flota.findByIdAndUpdate(req.body.vehiculo, { estado: 'en_ruta' });
    await Chofer.findByIdAndUpdate(req.body.chofer, { estado: 'en_viaje' });
    res.status(201).json({ success: true, data: viaje });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.update = async (req, res) => {
  try {
    const data = await Viaje.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.cambiarEstado = async (req, res) => {
  try {
    const { estado, notas } = req.body;
    const viaje = await Viaje.findById(req.params.id);
    if (!viaje) return res.status(404).json({ success: false, message: 'No encontrado' });
    viaje.estado = estado;
    viaje.eventos.push({ tipo: 'cambio_estado', descripcion: 'Estado: ' + estado + (notas ? '. ' + notas : ''), usuario: req.user.nombre });
    if (estado === 'finalizado') {
      viaje.fechaLlegadaReal = new Date();
      await Flota.findByIdAndUpdate(viaje.vehiculo, { estado: 'operativo' });
      await Chofer.findByIdAndUpdate(viaje.chofer, { estado: 'activo', '$inc': { totalViajes: 1 } });
    }
    await viaje.save();
    res.json({ success: true, data: viaje });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.addEvento = async (req, res) => {
  try {
    const viaje = await Viaje.findById(req.params.id);
    if (!viaje) return res.status(404).json({ success: false, message: 'No encontrado' });
    viaje.eventos.push({ ...req.body, usuario: req.user.nombre });
    await viaje.save();
    res.json({ success: true, data: viaje });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.addGasto = async (req, res) => {
  try {
    const viaje = await Viaje.findById(req.params.id);
    if (!viaje) return res.status(404).json({ success: false, message: 'No encontrado' });
    viaje.gastos.push(req.body);
    viaje.totalGastos = viaje.gastos.reduce((s,g) => s + g.monto, 0);
    await viaje.save();
    res.json({ success: true, data: viaje });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
