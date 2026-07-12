const mongoose = require('mongoose');
const s = new mongoose.Schema({
  tipo: { type: String, enum: ['velocidad','desvio','parada_no_autorizada','retraso','vtv_vencida','seguro_vencido','licencia_vencida','panico','combustible_bajo'], required: true },
  nivel: { type: String, enum: ['info','warning','critical'], default: 'warning' },
  vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Flota' },
  chofer: { type: mongoose.Schema.Types.ObjectId, ref: 'Chofer' },
  viaje: { type: mongoose.Schema.Types.ObjectId, ref: 'Viaje' },
  descripcion: String, valor: Number, lat: Number, lng: Number,
  resuelta: { type: Boolean, default: false },
  resueltaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fechaResolucion: Date, notas: String
}, { timestamps: true });
module.exports = mongoose.model('Alerta', s);
