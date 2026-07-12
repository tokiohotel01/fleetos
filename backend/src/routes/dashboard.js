const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/dashboardController');
r.get('/', auth, c.getDashboard);
module.exports = r;
