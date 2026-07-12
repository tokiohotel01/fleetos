const Mantenimiento = require('../models/Mantenimiento');
const Flota = require('../models/Flota');
exports.getAll = async (req, res) => {
  try {
    const q = {};
    if (req.query.vehiculo) q.vehiculo = req.query.vehiculo;
    if (req.query.estado) q.estado = req.query.estado;
    const data = await Mantenimiento.find(q).populate('vehiculo','patente marca modelo').sort({ createdAt: -1 });
    res.json({ success: true, data, total: data.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.getOne = async (req, res) => {
  try {
    const data = await Mantenimiento.findById(req.params.id).populate('vehiculo');
    if (!data) return res.status(404).json({ success: false, message: 'OT no encontrada' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.create = async (req, res) => {
  try {
    const data = await Mantenimiento.create({ ...req.body, creadoPor: req.user._id });
    if (req.body.vehiculo) await Flota.findByIdAndUpdate(req.body.vehiculo, { estado: 'en_taller' });
    res.status(201).json({ success: true, data });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.update = async (req, res) => {
  try {
    const data = await Mantenimiento.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'OT no encontrada' });
    if (req.body.estado === 'finalizada') await Flota.findByIdAndUpdate(data.vehiculo, { estado: 'operativo' });
    res.json({ success: true, data });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
