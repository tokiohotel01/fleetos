const Alerta = require('../models/Alerta');
exports.getAll = async (req, res) => {
  try {
    const q = {};
    if (req.query.resuelta !== undefined) q.resuelta = req.query.resuelta === 'true';
    if (req.query.nivel) q.nivel = req.query.nivel;
    const data = await Alerta.find(q).populate('vehiculo','patente').populate('chofer','nombre apellido').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data, total: data.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.create = async (req, res) => {
  try { res.status(201).json({ success: true, data: await Alerta.create(req.body) }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.resolver = async (req, res) => {
  try {
    const data = await Alerta.findByIdAndUpdate(req.params.id,
      { resuelta: true, resueltaPor: req.user._id, fechaResolucion: new Date(), notas: req.body.notas },
      { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'No encontrada' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
