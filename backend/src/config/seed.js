require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleetos');
  console.log('Conectado. Ejecutando seed...');

  const User = require('../models/User');
  const Cliente = require('../models/Cliente');
  const Flota = require('../models/Flota');
  const Chofer = require('../models/Chofer');
  const Viaje = require('../models/Viaje');

  await Promise.all([User.deleteMany({}), Cliente.deleteMany({}), Flota.deleteMany({}), Chofer.deleteMany({}), Viaje.deleteMany({})]);

  const users = await User.create([
    { nombre: 'Administrador General', email: 'admin@fleetos.com', password: 'admin123', rol: 'administrador', sucursal: 'Casa central' },
    { nombre: 'Laura Pérez', email: 'logistica@fleetos.com', password: 'admin123', rol: 'logistica', sucursal: 'Rosario' },
    { nombre: 'Carlos González', email: 'finanzas@fleetos.com', password: 'admin123', rol: 'finanzas', sucursal: 'Casa central' },
    { nombre: 'Martín Suárez', email: 'trafico@fleetos.com', password: 'admin123', rol: 'trafico', sucursal: 'Casa central' },
  ]);

  const clientes = await Cliente.create([
    { razonSocial: 'Molinos SA', cuit: '30-54789632-1', condicionIVA: 'Responsable Inscripto', ciudad: 'Buenos Aires', provincia: 'CABA', telefono: '011-4521-0000', email: 'logistica@molinos.com', contactos: [{ nombre: 'Carlos Vera', cargo: 'Jefe de Logística', email: 'c.vera@molinos.com', telefono: '11-4521-1234', principal: true }], tarifarios: [{ origen: 'Buenos Aires', destino: 'Córdoba', precio: 180000, vigenciaDesde: new Date() }] },
    { razonSocial: 'Arcor SAIC', cuit: '30-59487236-5', condicionIVA: 'Responsable Inscripto', ciudad: 'Córdoba', provincia: 'Córdoba', telefono: '0351-414-0000', email: 'logistica@arcor.com', contactos: [{ nombre: 'Ana Pérez', cargo: 'Coordinadora de Distribución', principal: true }] },
    { razonSocial: 'La Serenísima SA', cuit: '30-62547891-3', condicionIVA: 'Responsable Inscripto', ciudad: 'Buenos Aires', provincia: 'CABA', estado: 'moroso', saldoCuentaCorriente: 450000, contactos: [{ nombre: 'Diego Ramos', cargo: 'Gerente de Distribución', principal: true }] },
    { razonSocial: 'Quilmes SA', cuit: '30-71234567-8', condicionIVA: 'Responsable Inscripto', ciudad: 'Quilmes', provincia: 'Buenos Aires', contactos: [{ nombre: 'Roberto Silva', cargo: 'Logística', principal: true }] },
  ]);

  const hoy = new Date();
  const flota = await Flota.create([
    { patente: 'AC001AB', tipo: 'camion', marca: 'Scania', modelo: 'R450', anio: 2021, kmActuales: 184200, kmProximoService: 200000, capacidadToneladas: 30, estado: 'operativo', gpsActivo: true, vencimientos: [{ tipo: 'VTV', fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth()+3, 1) }, { tipo: 'Seguro', fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth()+2, 15) }, { tipo: 'RUTA', fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth()+5, 10) }] },
    { patente: 'AC003CD', tipo: 'camion', marca: 'Mercedes Benz', modelo: '2646', anio: 2019, kmActuales: 310550, capacidadToneladas: 28, estado: 'en_ruta', gpsActivo: true, vencimientos: [{ tipo: 'VTV', fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), 20) }, { tipo: 'Seguro', fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth()+4, 30) }] },
    { patente: 'AC007EF', tipo: 'camion', marca: 'Volvo', modelo: 'FH500', anio: 2022, kmActuales: 98300, capacidadToneladas: 32, estado: 'en_taller', vencimientos: [{ tipo: 'VTV', fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth()+5, 14) }, { tipo: 'Seguro', fechaVencimiento: new Date(hoy.getFullYear()-1, 11, 1) }] },
    { patente: 'AC012GH', tipo: 'camion', marca: 'Iveco', modelo: 'Stralis 460', anio: 2020, kmActuales: 245100, capacidadToneladas: 28, estado: 'operativo', gpsActivo: true, vencimientos: [{ tipo: 'VTV', fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth()+5, 3) }, { tipo: 'Seguro', fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth()+1, 22) }] },
    { patente: 'SR001IJ', tipo: 'semirremolque', marca: 'Randon', modelo: 'SR BA 3E', anio: 2020, capacidadToneladas: 30, capacidadM3: 90, estado: 'operativo', vencimientos: [{ tipo: 'Patente', fechaVencimiento: new Date(hoy.getFullYear(), 6, 30) }] },
    { patente: 'FR001KL', tipo: 'equipo_frio', marca: 'Carrier', modelo: 'Vector 1550', anio: 2021, temperaturaMin: -25, temperaturaMax: 8, estado: 'operativo', vencimientos: [{ tipo: 'Habilitacion', fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth()+4, 1) }] },
  ]);

  const choferes = await Chofer.create([
    { nombre: 'Juan', apellido: 'García', dni: '32145678', cuil: '20-32145678-9', telefono: '11-1234-5678', email: 'j.garcia@fleetos.com', ciudad: 'Buenos Aires', estado: 'en_viaje', unidadAsignada: flota[0]._id, totalViajes: 187, kmTotales: 284000, licencias: [{ numero: 'LIC-32145678', categoria: 'E', vencimiento: new Date('2026-12-01') }], psicofisicos: [{ fecha: new Date('2026-01-05'), vencimiento: new Date('2026-11-05'), resultado: 'apto', medico: 'Dr. Fernández' }] },
    { nombre: 'Roberto', apellido: 'Martínez', dni: '25478963', cuil: '20-25478963-2', telefono: '11-2345-6789', ciudad: 'Rosario', estado: 'en_viaje', unidadAsignada: flota[1]._id, totalViajes: 243, kmTotales: 412000, licencias: [{ numero: 'LIC-25478963', categoria: 'E', vencimiento: new Date('2026-07-14') }], psicofisicos: [{ fecha: new Date('2026-03-10'), vencimiento: new Date('2026-09-10'), resultado: 'apto' }] },
    { nombre: 'Miguel', apellido: 'López', dni: '28963147', cuil: '20-28963147-3', telefono: '11-3456-7890', ciudad: 'Córdoba', estado: 'activo', totalViajes: 142, kmTotales: 198000, licencias: [{ numero: 'LIC-28963147', categoria: 'E', vencimiento: new Date('2027-03-20') }], psicofisicos: [{ fecha: new Date('2026-02-15'), vencimiento: new Date('2026-08-15'), resultado: 'apto' }] },
    { nombre: 'Pedro', apellido: 'Gómez', dni: '18963254', cuil: '20-18963254-4', telefono: '11-4567-8901', ciudad: 'Mendoza', estado: 'suspendido', totalViajes: 156, kmTotales: 210000, licencias: [{ numero: 'LIC-18963254', categoria: 'E', vencimiento: new Date('2025-12-01') }], sanciones: [{ fecha: new Date('2026-05-10'), tipo: 'suspension', descripcion: 'Exceso de velocidad reiterado', diasSuspension: 15 }] },
  ]);

  await Viaje.create([
    { cliente: clientes[0]._id, vehiculo: flota[0]._id, chofer: choferes[0]._id, origen: { ciudad: 'Córdoba', provincia: 'Córdoba', lat: -31.4201, lng: -64.1888 }, destino: { ciudad: 'Buenos Aires', provincia: 'CABA', lat: -34.6037, lng: -58.3816 }, fechaSalida: new Date(), fechaLlegadaEstimada: new Date(Date.now()+36000000), estado: 'en_transito', cargaDescripcion: 'Harina a granel', cargaToneladas: 28, tarifaAcordada: 185000, distanciaKm: 710 },
    { cliente: clientes[1]._id, vehiculo: flota[1]._id, chofer: choferes[1]._id, origen: { ciudad: 'Rosario', provincia: 'Santa Fe', lat: -32.9468, lng: -60.6393 }, destino: { ciudad: 'Mendoza', provincia: 'Mendoza', lat: -32.8908, lng: -68.8272 }, fechaSalida: new Date(Date.now()-86400000), fechaLlegadaEstimada: new Date(), fechaLlegadaReal: new Date(), estado: 'finalizado', cargaDescripcion: 'Golosinas', cargaToneladas: 22, tarifaAcordada: 240000, distanciaKm: 1050 },
    { cliente: clientes[2]._id, vehiculo: flota[3]._id, chofer: choferes[2]._id, origen: { ciudad: 'Buenos Aires', provincia: 'CABA' }, destino: { ciudad: 'Tucumán', provincia: 'Tucumán' }, fechaSalida: new Date(Date.now()+7200000), fechaLlegadaEstimada: new Date(Date.now()+100000000), estado: 'en_carga', cargaDescripcion: 'Lácteos refrigerados', cargaToneladas: 20, requiereRefrigeracion: true, temperatura: 4, tarifaAcordada: 320000, distanciaKm: 1270 },
  ]);

  console.log('✅ Seed completado exitosamente');
  console.log('   Usuarios:', users.length);
  console.log('   Clientes:', clientes.length);
  console.log('   Flota:', flota.length, 'unidades');
  console.log('   Choferes:', choferes.length);
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
