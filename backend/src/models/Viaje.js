const mongoose = require('mongoose');
const s = new mongoose.Schema({
  numero: { type: String, unique: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Flota', required: true },
  semirremolque: { type: mongoose.Schema.Types.ObjectId, ref: 'Flota' },
  chofer: { type: mongoose.Schema.Types.ObjectId, ref: 'Chofer', required: true },
  origen: { descripcion: String, direccion: String, ciudad: String, provincia: String, lat: Number, lng: Number },
  destino: { descripcion: String, direccion: String, ciudad: String, provincia: String, lat: Number, lng: Number },
  paradas: [{ orden: Number, descripcion: String, ciudad: String, lat: Number, lng: Number, etaEstimada: Date, etaReal: Date, estado: { type: String, enum: ['pendiente','completada','omitida'], default: 'pendiente' }, notas: String }],
  fechaSalida: Date, fechaLlegadaEstimada: Date, fechaLlegadaReal: Date,
  estado: { type: String, enum: ['pendiente','programado','en_carga','en_transito','en_descarga','finalizado','facturado','cancelado'], default: 'pendiente' },
  cargaDescripcion: String, cargaToneladas: Number, cargaM3: Number,
  temperatura: Number, requiereRefrigeracion: { type: Boolean, default: false },
  distanciaKm: Number, kmInicio: Number, kmFin: Number,
  tarifaAcordada: Number, moneda: { type: String, default: 'ARS' },
  facturado: { type: Boolean, default: false },
  facturaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Factura' },
  gastos: [{ tipo: { type: String, enum: ['combustible','peaje','viatico','otros'] }, descripcion: String, monto: Number, comprobante: String, fecha: Date }],
  totalGastos: { type: Number, default: 0 },
  eventos: [{ fecha: { type: Date, default: Date.now }, tipo: String, descripcion: String, usuario: String, lat: Number, lng: Number }],
  hojaRuta: String, cartaPorte: String, remito: String,
  pod: String, fotosPOD: [String], firmaPOD: String,
  alertas: [{ tipo: String, descripcion: String, fecha: Date, resuelta: { type: Boolean, default: false } }],
  notas: String,
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
s.pre('save', async function(next) {
  if (!this.numero) {
    const count = await mongoose.model('Viaje').countDocuments();
    this.numero = 'VJ-' + String(count + 1).padStart(4, '0');
  }
  next();
});
module.exports = mongoose.model('Viaje', s);
