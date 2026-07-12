const mongoose = require('mongoose');
const s = new mongoose.Schema({
  patente: { type: String, required: true, unique: true, uppercase: true },
  tipo: { type: String, enum: ['camion','semirremolque','equipo_frio'], required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  anio: { type: Number, required: true },
  numeroMotor: String, numeroChasis: String,
  kmActuales: { type: Number, default: 0 }, kmProximoService: Number,
  capacidadToneladas: Number, capacidadM3: Number,
  temperaturaMin: Number, temperaturaMax: Number,
  vencimientos: [{
    tipo: { type: String, enum: ['VTV','Seguro','RUTA','Patente','Habilitacion'] },
    fechaVencimiento: Date, numeroDocumento: String, proveedor: String, costo: Number, archivo: String
  }],
  estado: { type: String, enum: ['operativo','en_ruta','en_taller','fuera_servicio'], default: 'operativo' },
  choferAsignado: { type: mongoose.Schema.Types.ObjectId, ref: 'Chofer' },
  gpsImei: String, gpsActivo: { type: Boolean, default: false },
  ultimaPosicion: { lat: Number, lng: Number, velocidad: Number, timestamp: Date },
  notas: String, foto: String
}, { timestamps: true });
module.exports = mongoose.model('Flota', s);
