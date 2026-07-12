const Auditoria = require('../models/Auditoria');
const audit = (accion, modulo) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (res.statusCode < 400 && req.user) {
      try {
        await Auditoria.create({
          usuario: req.user._id, nombreUsuario: req.user.nombre,
          accion, modulo, ip: req.ip,
          detalle: JSON.stringify({ body: req.body, params: req.params }).substring(0, 500)
        });
      } catch (e) {}
    }
    return originalJson(data);
  };
  next();
};
module.exports = audit;
