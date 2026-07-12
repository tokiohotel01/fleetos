const r = require('express').Router();
const { auth } = require('../middleware/auth');
const multer = require('multer');
const Viaje = require('../models/Viaje');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 20*1024*1024 } });
r.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Sin archivo' });
  res.json({ success: true, url: '/uploads/' + req.file.filename, nombre: req.file.originalname });
});
r.post('/viaje/:id/pod', auth, upload.fields([{ name: 'fotos', maxCount: 10 }, { name: 'firma', maxCount: 1 }]), async (req, res) => {
  try {
    const viaje = await Viaje.findById(req.params.id);
    if (!viaje) return res.status(404).json({ success: false, message: 'No encontrado' });
    if (req.files.fotos) viaje.fotosPOD = req.files.fotos.map(f => '/uploads/' + f.filename);
    if (req.files.firma) viaje.firmaPOD = '/uploads/' + req.files.firma[0].filename;
    await viaje.save();
    res.json({ success: true, data: viaje });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
module.exports = r;
