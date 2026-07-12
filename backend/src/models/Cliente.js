const mongoose = require('mongoose');
const s = new mongoose.Schema({
  razonSocial: { type: String, required: true, trim: true },
  cuit: { type: String, required: true, unique: true },
  condicionIVA: { type: String, enum: ['Responsable Inscripto','Monotributista','Exento','Consumidor Final'], default: 'Responsable Inscripto' },
  direccion: String, ciudad: String, provincia: String, telefono: String, email: String,
  contactos: [{ nombre: String, cargo: String, email: String, telefono: String, principal: { type: Boolean, default: false } }],
  tarifarios: [{ origen: String, destino: String, precio: Number, moneda: { type: String, default: 'ARS' }, vigenciaDesde: Date, vigenciaHasta: Date }],
  limiteCredito: { type: Number, default: 0 },
  saldoCuentaCorriente: { type: Number, default: 0 },
  estado: { type: String, enum: ['activo','inactivo','moroso'], default: 'activo' },
  notas: String, portalActivo: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Cliente', s);
