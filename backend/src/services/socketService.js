const Alerta = require('../models/Alerta');
const Flota = require('../models/Flota');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket conectado:', socket.id);

    socket.on('auth', (data) => {
      socket.join('torre');
      socket.emit('connected', { message: 'Conectado a Torre de Control' });
    });

    socket.on('gps_update', async ({ vehiculoId, lat, lng, velocidad, rumbo }) => {
      try {
        await Flota.findByIdAndUpdate(vehiculoId, { ultimaPosicion: { lat, lng, velocidad, timestamp: new Date() } });
        if (velocidad > 110) {
          const alerta = await Alerta.create({ tipo: 'velocidad', nivel: 'critical', vehiculo: vehiculoId, descripcion: 'Exceso de velocidad: ' + velocidad + ' km/h', valor: velocidad, lat, lng });
          io.to('torre').emit('alerta_nueva', alerta);
        }
        io.to('torre').emit('posicion_update', { vehiculoId, lat, lng, velocidad, rumbo, timestamp: new Date() });
      } catch (e) { console.error('GPS error:', e.message); }
    });

    socket.on('panico', async ({ vehiculoId, choferId, lat, lng }) => {
      try {
        const alerta = await Alerta.create({ tipo: 'panico', nivel: 'critical', vehiculo: vehiculoId, chofer: choferId, descripcion: 'BOTON DE PANICO ACTIVADO', lat, lng });
        io.to('torre').emit('panico', alerta);
        console.log('PANICO activado:', vehiculoId);
      } catch (e) { console.error('Panico error:', e.message); }
    });

    socket.on('mensaje', (data) => {
      io.to('torre').emit('mensaje_recibido', { ...data, timestamp: new Date() });
    });

    socket.on('disconnect', () => console.log('Socket desconectado:', socket.id));
  });

  setInterval(async () => {
    try {
      if (io.sockets.sockets.size > 0) {
        const unidades = await Flota.find({ estado: 'en_ruta' }).select('_id ultimaPosicion patente estado');
        if (unidades.length) io.to('torre').emit('flota_snapshot', unidades);
      }
    } catch (e) {}
  }, 10000);
};
