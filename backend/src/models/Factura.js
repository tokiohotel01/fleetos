const mongoose = require('mongoose');
const s = new mongoose.Schema({
  numero: { type: String, unique: true },
  tipo: { type: String, enum: ['A','B','C','E'], default: 'A' },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  viajes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Viaje' }],
  items: [{ descripcion: String, cantidad: Number, precioUnitario: Number, subtotal: Number }],
  subtotal: Number, iva: Number, total: { type: Number, required: true },
  moneda: { type: String, default: 'ARS' },
  fechaEmision: { type: Date, default: Date.now }, fechaVencimiento: Date,
  estado: { type: String, enum: ['emitida','pagada','vencida','anulada'], default: 'emitida' },
  metodoPago: String, notas: String, pdf: String,
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
s.pre('save', async function(next) {
  if (!this.numero) {
    const count = await mongoose.model('Factura').countDocuments();
    this.numero = 'FC-' + String(count + 1).padStart(5, '0');
  }
  next();
});
module.exports = mongoose.model('Factura', s);
