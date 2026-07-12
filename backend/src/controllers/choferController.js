const Chofer = require('../models/Chofer');
exports.getAll = async (req, res) => {
  try {
    const q = {};
    if (req.query.estado) q.estado = req.query.estado;
    if (req.query.search) q.$or = [{ nombre: new RegExp(req.query.search,'i') }, { apellido: new RegExp(req.query.search,'i') }, { dni: new RegExp(req.query.search,'i') }];
    const data = await Chofer.find(q).populate('unidadAsignada','patente marca modelo').sort({ apellido: 1 });
    res.json({ success: true, data, total: data.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.getOne = async (req, res) => {
  try {
    const data = await Chofer.findById(req.params.id).populate('unidadAsignada');
    if (!data) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.create = async (req, res) => {
  try { res.status(201).json({ success: true, data: await Chofer.create(req.body) }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.update = async (req, res) => {
  try {
    const data = await Chofer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.addSancion = async (req, res) => {
  try {
    const doc = await Chofer.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'No encontrado' });
    doc.sanciones.push(req.body); await doc.save();
    res.json({ success: true, data: doc });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
