import React, { useEffect, useState } from 'react';
import { dashboardAPI, viajesAPI } from '../services/api';
import { KpiCard, Card, Badge, Btn } from '../components/common';
import { formatCurrency, estadoViajeLabel, estadoViajeColor } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([dashboardAPI.get(), viajesAPI.getAll({ limit: 6 })])
      .then(([d, v]) => { setData(d.data.data); setViajes(v.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px',color:'var(--text3)'}}><span className="spinner" style={{width:'24px',height:'24px',borderWidth:'3px'}} /></div>;

  const nivelColor = n => n === 'critical' ? 'red' : n === 'warning' ? 'amber' : 'blue';
  const tipoIcon = t => ({ velocidad:'fa-gauge-max', desvio:'fa-road-barrier', panico:'fa-hand-point-up', vtv_vencida:'fa-file-circle-exclamation', retraso:'fa-clock' }[t] || 'fa-triangle-exclamation');

  return (
    <div>
      <div style={{marginBottom:'24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:'500'}}>Dashboard</h1>
          <div style={{fontSize:'12px',color:'var(--text3)',marginTop:'2px'}}>{new Date().toLocaleDateString('es-AR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <Btn variant="primary" onClick={() => navigate('/viajes')}><i className="fa-solid fa-plus" /> Nuevo viaje</Btn>
      </div>

      <div className="grid g4" style={{marginBottom:'20px'}}>
        <KpiCard icon="fa-route" value={data?.viajesActivos ?? '–'} label="Viajes activos" color="blue" />
        <KpiCard icon="fa-truck" value={`${data?.flotaOperativa ?? '–'}/${data?.flotaTotal ?? '–'}`} label="Flota operativa" color="green" progress={data ? Math.round((data.flotaOperativa/data.flotaTotal)*100) : 0} />
        <KpiCard icon="fa-dollar-sign" value={formatCurrency(data?.facturacionMes)} label="Facturación del mes" color="purple" />
        <KpiCard icon="fa-triangle-exclamation" value={data?.alertasCriticas ?? '–'} label="Alertas críticas" color="red" />
      </div>

      <div className="grid g2" style={{gap:'20px',marginBottom:'20px',gridTemplateColumns:'1.4fr 1fr'}}>
        <Card noPad>
          <div style={{padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--border)'}}>
            <span style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)'}}>Viajes recientes</span>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/viajes')}>Ver todos</Btn>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>N°</th><th>Ruta</th><th>Chofer</th><th>Estado</th></tr></thead>
              <tbody>
                {viajes.map(v => (
                  <tr key={v._id} onClick={() => navigate('/viajes')}>
                    <td style={{color:'var(--text)',fontWeight:'500'}}>{v.numero}</td>
                    <td>{v.origen?.ciudad} → {v.destino?.ciudad}</td>
                    <td>{v.chofer ? v.chofer.nombre + ' ' + v.chofer.apellido : '–'}</td>
                    <td><Badge color={estadoViajeColor(v.estado)}>{estadoViajeLabel(v.estado)}</Badge></td>
                  </tr>
                ))}
                {viajes.length === 0 && <tr><td colSpan={4} style={{textAlign:'center',padding:'32px',color:'var(--text3)'}}>Sin viajes recientes</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            Alertas activas
            <Btn variant="ghost" size="sm" onClick={() => navigate('/torre')}>Torre</Btn>
          </div>
          {data?.alertas?.length ? data.alertas.slice(0,6).map(a => (
            <div key={a._id} className={`alert-item ${a.nivel}`}>
              <div className={`act-icon kpi-${nivelColor(a.nivel)}`}><i className={`fa-solid ${tipoIcon(a.tipo)}`} /></div>
              <div style={{flex:1}}>
                <div className="alert-title">{a.descripcion}</div>
                <div className="alert-sub">{a.vehiculo?.patente} · {new Date(a.createdAt).toLocaleTimeString('es-AR')}</div>
              </div>
              <Badge color={nivelColor(a.nivel)}>{a.nivel}</Badge>
            </div>
          )) : <div style={{color:'var(--text3)',fontSize:'13px',padding:'20px 0',textAlign:'center'}}><i className="fa-solid fa-check-circle" style={{color:'var(--green)',marginRight:'8px'}} />Sin alertas activas</div>}
        </Card>
      </div>

      <div className="grid g4">
        <Card style={{cursor:'pointer'}} onClick={() => navigate('/flota')}>
          <div className="kpi-icon kpi-blue"><i className="fa-solid fa-truck" /></div>
          <div className="kpi-value">{data?.flotaTotal ?? '–'}</div>
          <div className="card-label">Unidades de flota</div>
          <div className="card-sub" style={{marginTop:'4px'}}>Ver detalles →</div>
        </Card>
        <Card style={{cursor:'pointer'}} onClick={() => navigate('/choferes')}>
          <div className="kpi-icon kpi-teal"><i className="fa-solid fa-id-card" /></div>
          <div className="kpi-value">{data?.choferesActivos ?? '–'}</div>
          <div className="card-label">Choferes activos</div>
          <div className="card-sub" style={{marginTop:'4px'}}>Ver legajos →</div>
        </Card>
        <Card style={{cursor:'pointer'}} onClick={() => navigate('/flota')}>
          <div className="kpi-icon kpi-amber"><i className="fa-solid fa-calendar-exclamation" /></div>
          <div className="kpi-value">{data?.vencimientosCercanos ?? '–'}</div>
          <div className="card-label">Vencimientos 30 días</div>
          <div className="card-sub" style={{marginTop:'4px'}}>Ver vencimientos →</div>
        </Card>
        <Card style={{cursor:'pointer'}} onClick={() => navigate('/reportes')}>
          <div className="kpi-icon kpi-purple"><i className="fa-solid fa-chart-pie" /></div>
          <div className="kpi-value">BI</div>
          <div className="card-label">Reportes y análisis</div>
          <div className="card-sub" style={{marginTop:'4px'}}>Ver reportes →</div>
        </Card>
      </div>
    </div>
  );
}
