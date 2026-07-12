export const formatCurrency = (n, cur='ARS') =>
  new Intl.NumberFormat('es-AR', { style:'currency', currency:cur, maximumFractionDigits:0 }).format(n||0);
export const formatDate = d => d ? new Date(d).toLocaleDateString('es-AR') : '–';
export const formatDateTime = d => d ? new Date(d).toLocaleString('es-AR') : '–';
export const formatKm = n => n ? n.toLocaleString('es-AR') + ' km' : '–';
export const diasHasta = fecha => {
  if (!fecha) return null;
  return Math.ceil((new Date(fecha) - new Date()) / (1000*60*60*24));
};
export const vencimientoColor = fecha => {
  const d = diasHasta(fecha);
  if (d === null) return 'gray';
  if (d < 0) return 'red';
  if (d < 30) return 'amber';
  return 'green';
};
export const estadoViajeLabel = e => ({ pendiente:'Pendiente', programado:'Programado', en_carga:'En carga', en_transito:'En tránsito', en_descarga:'En descarga', finalizado:'Finalizado', facturado:'Facturado', cancelado:'Cancelado' }[e] || e);
export const estadoViajeColor = e => ({ pendiente:'gray', programado:'gray', en_carga:'amber', en_transito:'blue', en_descarga:'amber', finalizado:'green', facturado:'teal', cancelado:'red' }[e] || 'gray');
export const estadoFlotaLabel = e => ({ operativo:'Operativo', en_ruta:'En ruta', en_taller:'En taller', fuera_servicio:'Fuera de servicio' }[e] || e);
export const estadoFlotaColor = e => ({ operativo:'green', en_ruta:'blue', en_taller:'amber', fuera_servicio:'red' }[e] || 'gray');
