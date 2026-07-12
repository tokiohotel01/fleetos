const r = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Auditoria = require('../models/Auditoria');
r.get('/', auth, authorize('administrador'), async (req, res) => {
  try { res.json({ success: true, data: await User.find().sort({ nombre: 1 }) }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r.post('/', auth, authorize('administrador'), async (req, res) => {
  try { res.status(201).json({ success: true, data: await User.create(req.body) }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});
r.put('/:id', auth, authorize('administrador'), async (req, res) => {
  try { res.json({ success: true, data: await User.findByIdAndUpdate(req.params.id, req.body, { new: true }) }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});
r.delete('/:id', auth, authorize('administrador'), async (req, res) => {
  try { await User.findByIdAndUpdate(req.params.id, { activo: false }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r.get('/auditoria', auth, authorize('administrador'), async (req, res) => {
  try { res.json({ success: true, data: await Auditoria.find().sort({ createdAt: -1 }).limit(200) }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
module.exports = r;
