const Flota = require('../models/Flota');
exports.getAll = async (req, res) => {
  try {
    const q = {};
    if (req.query.tipo) q.tipo = req.query.tipo;
    if (req.query.estado) q.estado = req.query.estado;
    if (req.query.search) q.$or = [{ patente: new RegExp(req.query.search,'i') }, { marca: new RegExp(req.query.search,'i') }];
    const data = await Flota.find(q).populate('choferAsignado','nombre apellido').sort({ patente: 1 });
    res.json({ success: true, data, total: data.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.getOne = async (req, res) => {
  try {
    const data = await Flota.findById(req.params.id).populate('choferAsignado');
    if (!data) return res.status(404).json({ success: false, message: 'No encontrada' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.create = async (req, res) => {
  try { res.status(201).json({ success: true, data: await Flota.create(req.body) }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.update = async (req, res) => {
  try {
    const data = await Flota.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'No encontrada' });
    res.json({ success: true, data });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.updatePosicion = async (req, res) => {
  try {
    const { lat, lng, velocidad } = req.body;
    const data = await Flota.findByIdAndUpdate(req.params.id, { ultimaPosicion: { lat, lng, velocidad, timestamp: new Date() } }, { new: true });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.getVencimientos = async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 90;
    const limite = new Date(); limite.setDate(limite.getDate() + dias);
    const hoy = new Date();
    const unidades = await Flota.find({ 'vencimientos.fechaVencimiento': { '$lte': limite } });
    const lista = [];
    unidades.forEach(u => u.vencimientos.forEach(v => {
      if (v.fechaVencimiento <= limite)
        lista.push({ unidad: { _id: u._id, patente: u.patente, marca: u.marca, modelo: u.modelo }, tipo: v.tipo, fechaVencimiento: v.fechaVencimiento, vencido: v.fechaVencimiento < hoy });
    }));
    lista.sort((a,b) => a.fechaVencimiento - b.fechaVencimiento);
    res.json({ success: true, data: lista });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
