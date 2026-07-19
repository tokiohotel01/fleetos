import axios from 'axios';
const api = axios.create({ baseURL: (process.env.REACT_APP_API_URL || '') + '/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = 'Bearer ' + t;
  return cfg;
});
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; }
  return Promise.reject(err);
});
export const authAPI = { login: d => api.post('/auth/login',d), me: () => api.get('/auth/me'), changePassword: d => api.put('/auth/change-password',d) };
export const dashboardAPI = { get: () => api.get('/dashboard') };
export const clientesAPI = { getAll: p => api.get('/clientes',{params:p}), getOne: id => api.get(`/clientes/${id}`), create: d => api.post('/clientes',d), update: (id,d) => api.put(`/clientes/${id}`,d), remove: id => api.delete(`/clientes/${id}`) };
export const flotaAPI = { getAll: p => api.get('/flota',{params:p}), getOne: id => api.get(`/flota/${id}`), create: d => api.post('/flota',d), update: (id,d) => api.put(`/flota/${id}`,d), getVencimientos: p => api.get('/flota/vencimientos',{params:p}), updatePosicion: (id,d) => api.patch(`/flota/${id}/posicion`,d) };
export const choferesAPI = { getAll: p => api.get('/choferes',{params:p}), getOne: id => api.get(`/choferes/${id}`), create: d => api.post('/choferes',d), update: (id,d) => api.put(`/choferes/${id}`,d), addSancion: (id,d) => api.post(`/choferes/${id}/sanciones`,d) };
export const viajesAPI = { getAll: p => api.get('/viajes',{params:p}), getOne: id => api.get(`/viajes/${id}`), create: d => api.post('/viajes',d), update: (id,d) => api.put(`/viajes/${id}`,d), cambiarEstado: (id,d) => api.patch(`/viajes/${id}/estado`,d), addEvento: (id,d) => api.post(`/viajes/${id}/eventos`,d), addGasto: (id,d) => api.post(`/viajes/${id}/gastos`,d) };
export const finanzasAPI = { getResumen: () => api.get('/finanzas/resumen'), getFacturas: p => api.get('/finanzas/facturas',{params:p}), crearFactura: d => api.post('/finanzas/facturas',d), registrarPago: id => api.patch(`/finanzas/facturas/${id}/pago`) };
export const combustibleAPI = { getAll: p => api.get('/combustible',{params:p}), create: d => api.post('/combustible',d), rendimiento: () => api.get('/combustible/rendimiento') };
export const mantenimientoAPI = { getAll: p => api.get('/mantenimiento',{params:p}), getOne: id => api.get(`/mantenimiento/${id}`), create: d => api.post('/mantenimiento',d), update: (id,d) => api.put(`/mantenimiento/${id}`,d) };
export const alertasAPI = { getAll: p => api.get('/alertas',{params:p}), resolver: (id,d) => api.patch(`/alertas/${id}/resolver`,d) };
export const reportesAPI = { rentabilidadCliente: () => api.get('/reportes/rentabilidad-cliente'), kpi: () => api.get('/reportes/kpi') };
export const usersAPI = { getAll: () => api.get('/users'), create: d => api.post('/users',d), update: (id,d) => api.put(`/users/${id}`,d), getAuditoria: () => api.get('/users/auditoria') };
export default api;
