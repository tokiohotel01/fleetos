const Viaje = require('../models/Viaje');
const Combustible = require('../models/Combustible');
const Flota = require('../models/Flota');

exports.rentabilidadPorCliente = async (req, res) => {
  try {
    const data = await Viaje.aggregate([
      { '$match': { estado: { '$in': ['finalizado','facturado'] } } },
      { '$group': { _id: '$cliente', ingresos: { '$sum': '$tarifaAcordada' }, gastos: { '$sum': '$totalGastos' }, viajes: { '$sum': 1 } } },
      { '$addFields': { rentabilidad: { '$subtract': ['$ingresos','$gastos'] }, margen: { '$cond': [{ '$gt': ['$ingresos',0] }, { '$multiply': [{ '$divide': [{ '$subtract': ['$ingresos','$gastos'] },'$ingresos'] }, 100] }, 0] } } },
      { '$lookup': { from: 'clientes', localField: '_id', foreignField: '_id', as: 'cliente' } },
      { '$unwind': '$cliente' },
      { '$project': { razonSocial: '$cliente.razonSocial', ingresos: 1, gastos: 1, rentabilidad: 1, margen: 1, viajes: 1 } },
      { '$sort': { rentabilidad: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.rentabilidadPorUnidad = async (req, res) => {
  try {
    const data = await Viaje.aggregate([
      { '$match': { estado: { '$in': ['finalizado','facturado'] } } },
      { '$group': { _id: '$vehiculo', ingresos: { '$sum': '$tarifaAcordada' }, gastos: { '$sum': '$totalGastos' }, viajes: { '$sum': 1 }, km: { '$sum': '$distanciaKm' } } },
      { '$lookup': { from: 'flotas', localField: '_id', foreignField: '_id', as: 'vehiculo' } },
      { '$unwind': '$vehiculo' },
      { '$project': { patente: '$vehiculo.patente', marca: '$vehiculo.marca', modelo: '$vehiculo.modelo', ingresos: 1, gastos: 1, viajes: 1, km: 1, rentabilidad: { '$subtract': ['$ingresos','$gastos'] } } },
      { '$sort': { rentabilidad: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.kpiLogisticos = async (req, res) => {
  try {
    const [total, aTiempo, comb, disponibles, totalFlota] = await Promise.all([
      Viaje.countDocuments({ estado: { '$in': ['finalizado','facturado'] } }),
      Viaje.countDocuments({ estado: { '$in': ['finalizado','facturado'] }, '$expr': { '$lte': ['$fechaLlegadaReal','$fechaLlegadaEstimada'] } }),
      Combustible.aggregate([{ '$group': { _id: null, litros: { '$sum': '$litros' }, costo: { '$sum': '$total' } } }]),
      Flota.countDocuments({ estado: { '$in': ['operativo','en_ruta'] } }),
      Flota.countDocuments()
    ]);
    res.json({ success: true, data: {
      totalViajes: total,
      otif: total > 0 ? ((aTiempo/total)*100).toFixed(1) : 0,
      litrosTotales: comb[0]?.litros || 0,
      costoCombustible: comb[0]?.costo || 0,
      disponibilidadFlota: totalFlota > 0 ? ((disponibles/totalFlota)*100).toFixed(1) : 0
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
