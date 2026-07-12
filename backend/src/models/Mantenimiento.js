const mongoose = require('mongoose');
const s = new mongoose.Schema({
  numero: { type: String, unique: true },
  vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Flota', required: true },
  tipo: { type: String, enum: ['preventivo','correctivo','service','neumaticos','otros'], required: true },
  taller: { type: String, enum: ['propio','externo'], required: true },
  nombreTaller: String, descripcion: { type: String, required: true },
  trabajosRealizados: String,
  repuestosUsados: [{ descripcion: String, cantidad: Number, costo: Number }],
  costoManoObra: { type: Number, default: 0 },
  costoRepuestos: { type: Number, default: 0 },
  costoTotal: { type: Number, default: 0 },
  kmIngreso: Number,
  fechaIngreso: { type: Date, default: Date.now },
  fechaEgresoEstimada: Date, fechaEgresoReal: Date,
  estado: { type: String, enum: ['abierta','en_proceso','finalizada','cancelada'], default: 'abierta' },
  archivos: [String], notas: String,
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
s.pre('save', async function(next) {
  if (!this.numero) {
    const count = await mongoose.model('Mantenimiento').countDocuments();
    this.numero = 'OT-' + String(count + 1).padStart(4, '0');
  }
  this.costoTotal = (this.costoManoObra || 0) + (this.costoRepuestos || 0);
  next();
});
module.exports = mongoose.model('Mantenimiento', s);
