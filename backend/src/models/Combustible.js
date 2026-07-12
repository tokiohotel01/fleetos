const mongoose = require('mongoose');
const s = new mongoose.Schema({
  vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Flota', required: true },
  chofer: { type: mongoose.Schema.Types.ObjectId, ref: 'Chofer' },
  viaje: { type: mongoose.Schema.Types.ObjectId, ref: 'Viaje' },
  fecha: { type: Date, default: Date.now },
  litros: { type: Number, required: true },
  precioPorLitro: { type: Number, required: true },
  total: Number,
  tipoCombustible: { type: String, enum: ['gasoil','gasoil_premium','nafta','gnc'], default: 'gasoil' },
  estacion: String, ciudad: String, kmActual: Number, tarjeta: String, comprobante: String, notas: String,
  cargadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
s.pre('save', function(next) { this.total = this.litros * this.precioPorLitro; next(); });
module.exports = mongoose.model('Combustible', s);
