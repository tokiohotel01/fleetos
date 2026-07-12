const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const c = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleetos');
    console.log('✅ MongoDB conectado:', c.connection.host);
  } catch (e) { console.error('❌ Error MongoDB:', e.message); process.exit(1); }
};
module.exports = connectDB;
