require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET','POST'] } });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

connectDB();

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/clientes',      require('./routes/clientes'));
app.use('/api/flota',         require('./routes/flota'));
app.use('/api/choferes',      require('./routes/choferes'));
app.use('/api/viajes',        require('./routes/viajes'));
app.use('/api/finanzas',      require('./routes/finanzas'));
app.use('/api/combustible',   require('./routes/combustible'));
app.use('/api/mantenimiento', require('./routes/mantenimiento'));
app.use('/api/documentos',    require('./routes/documentos'));
app.use('/api/reportes',      require('./routes/reportes'));
app.use('/api/alertas',       require('./routes/alertas'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

require('./services/socketService')(io);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('FleetOS Backend en puerto ' + PORT));
module.exports = { app, io };
