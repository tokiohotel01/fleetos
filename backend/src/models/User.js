const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const s = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  rol: { type: String, enum: ['administrador','logistica','finanzas','trafico','rrhh','chofer','cliente'], default: 'logistica' },
  sucursal: { type: String, default: 'Casa central' },
  activo: { type: Boolean, default: true },
  avatar: String, ultimoAcceso: Date
}, { timestamps: true });
s.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); next();
});
s.methods.comparePassword = function(p) { return require('bcryptjs').compare(p, this.password); };
s.methods.toJSON = function() { const o = this.toObject(); delete o.password; return o; };
module.exports = mongoose.model('User', s);
