const r = require('express').Router();
const c = require('../controllers/combustibleController');
const { auth } = require('../middleware/auth');
r.get('/rendimiento', auth, c.rendimiento);
r.get('/', auth, c.getAll);
r.post('/', auth, c.create);
module.exports = r;
