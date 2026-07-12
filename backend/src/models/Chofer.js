const mongoose = require('mongoose');
const s = new mongoose.Schema({
  nombre: { type: String, required: true }, apellido: { type: String, required: true },
  dni: { type: String, required: true, unique: true }, cuil: { type: String, required: true },
  fechaNacimiento: Date, telefono: String, email: String,
  direccion: String, ciudad: String, provincia: String,
  licencias: [{ numero: String, categoria: { type: String, enum: ['A','B','C','D','E'] }, vencimiento: Date, archivo: String }],
  psicofisicos: [{ fecha: Date, vencimiento: Date, resultado: { type: String, enum: ['apto','apto_condicional','no_apto'] }, medico: String, archivo: String }],
  sanciones: [{ fecha: Date, tipo: { type: String, enum: ['advertencia','suspension','informe'] }, descripcion: String, diasSuspension: Number, resuelta: { type: Boolean, default: false } }],
  estado: { type: String, enum: ['activo','en_viaje','licencia','suspendido','inactivo'], default: 'activo' },
  unidadAsignada: { type: mongoose.Schema.Types.ObjectId, ref: 'Flota' },
  totalViajes: { type: Number, default: 0 }, kmTotales: { type: Number, default: 0 },
  foto: String, notas: String,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
s.virtual('nombreCompleto').get(function() { return this.nombre + ' ' + this.apellido; });
module.exports = mongoose.model('Chofer', s);
