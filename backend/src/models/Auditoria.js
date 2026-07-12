const mongoose = require('mongoose');
const s = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nombreUsuario: String, accion: String, modulo: String, ip: String, detalle: String
}, { timestamps: true });
module.exports = mongoose.model('Auditoria', s);
