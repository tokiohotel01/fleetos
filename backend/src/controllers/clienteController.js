const Cliente = require('../models/Cliente');
exports.getAll = async (req, res) => {
  try {
    const { estado, search, page = 1, limit = 20 } = req.query;
    const q = {};
    if (estado) q.estado = estado;
    if (search) q.$or = [{ razonSocial: new RegExp(search,'i') }, { cuit: new RegExp(search,'i') }];
    const total = await Cliente.countDocuments(q);
    const data = await Cliente.find(q).skip((page-1)*limit).limit(Number(limit)).sort({ razonSocial: 1 });
    res.json({ success: true, data, total, page: Number(page), pages: Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.getOne = async (req, res) => {
  try {
    const data = await Cliente.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.create = async (req, res) => {
  try { res.status(201).json({ success: true, data: await Cliente.create(req.body) }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.update = async (req, res) => {
  try {
    const data = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.remove = async (req, res) => {
  try { await Cliente.findByIdAndUpdate(req.params.id, { estado: 'inactivo' }); res.json({ success: true, message: 'Dado de baja' }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
