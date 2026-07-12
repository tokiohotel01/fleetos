const Combustible = require('../models/Combustible');
exports.getAll = async (req, res) => {
  try {
    const q = {};
    if (req.query.vehiculo) q.vehiculo = req.query.vehiculo;
    if (req.query.chofer) q.chofer = req.query.chofer;
    const data = await Combustible.find(q).populate('vehiculo','patente marca').populate('chofer','nombre apellido').sort({ fecha: -1 }).limit(200);
    res.json({ success: true, data, total: data.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.create = async (req, res) => {
  try { res.status(201).json({ success: true, data: await Combustible.create({ ...req.body, cargadoPor: req.user._id }) }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.rendimiento = async (req, res) => {
  try {
    const data = await Combustible.aggregate([
      { '$group': { _id: '$vehiculo', totalLitros: { '$sum': '$litros' }, totalCosto: { '$sum': '$total' }, cargas: { '$sum': 1 } } },
      { '$lookup': { from: 'flotas', localField: '_id', foreignField: '_id', as: 'vehiculo' } },
      { '$unwind': '$vehiculo' },
      { '$project': { patente: '$vehiculo.patente', marca: '$vehiculo.marca', modelo: '$vehiculo.modelo', totalLitros: 1, totalCosto: 1, cargas: 1 } }
    ]);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
