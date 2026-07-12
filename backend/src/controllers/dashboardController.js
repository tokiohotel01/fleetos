const Viaje = require('../models/Viaje');
const Flota = require('../models/Flota');
const Chofer = require('../models/Chofer');
const Alerta = require('../models/Alerta');
const Factura = require('../models/Factura');

exports.getDashboard = async (req, res) => {
  try {
    const ini = new Date(); ini.setDate(1); ini.setHours(0,0,0,0);
    const [viajesActivos, flotaStats, alertas, facturas, choferes, vencimientos] = await Promise.all([
      Viaje.countDocuments({ estado: { '$in': ['en_transito','en_carga','en_descarga'] } }),
      Flota.aggregate([{ '$group': { _id: '$estado', count: { '$sum': 1 } } }]),
      Alerta.find({ resuelta: false }).populate('vehiculo','patente').sort({ createdAt: -1 }).limit(10),
      Factura.aggregate([{ '$match': { createdAt: { '$gte': ini }, estado: { '$ne': 'anulada' } } }, { '$group': { _id: null, total: { '$sum': '$total' } } }]),
      Chofer.countDocuments({ estado: { '$in': ['activo','en_viaje'] } }),
      Flota.countDocuments({ 'vencimientos.fechaVencimiento': { '$lte': new Date(Date.now() + 30*86400000) } })
    ]);
    const fm = {};
    flotaStats.forEach(f => { fm[f._id] = f.count; });
    res.json({ success: true, data: {
      viajesActivos,
      flotaOperativa: (fm.operativo || 0) + (fm.en_ruta || 0),
      flotaTotal: Object.values(fm).reduce((a,b) => a+b, 0),
      alertasCriticas: alertas.filter(a => a.nivel === 'critical').length,
      alertas,
      facturacionMes: facturas[0]?.total || 0,
      choferesActivos: choferes,
      vencimientosCercanos: vencimientos
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
