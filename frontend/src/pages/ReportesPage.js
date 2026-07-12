import React, { useEffect, useState } from 'react';
import { reportesAPI } from '../services/api';
import { PageHeader, Card, KpiCard, Tabs } from '../components/common';
import { formatCurrency } from '../utils/helpers';

export default function ReportesPage() {
  const [kpi, setKpi] = useState(null);
  const [rentCliente, setRentCliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('kpi');

  useEffect(() => {
    Promise.all([reportesAPI.kpi(), reportesAPI.rentabilidadCliente()])
      .then(([k, r]) => { setKpi(k.data.data); setRentCliente(r.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const Bar = ({ label, value, max, color='var(--accent)', suffix='' }) => (
    <div style={{marginBottom:'14px'}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'5px'}}>
        <span style={{color:'var(--text2)'}}>{label}</span>
        <span style={{color:'var(--text3)',fontFamily:'var(--mono)'}}>{value}{suffix}</span>
      </div>
      <div className="progress-bar" style={{height:'6px'}}><div className="progress-fill" style={{width:max?Math.min(100,(value/max*100))+'%':'50%',background:color}} /></div>
    </div>
  );

  const TABS = [{ key:'kpi', label:'KPIs logísticos' }, { key:'clientes', label:'Por cliente' }, { key:'combustible', label:'Combustible' }];

  return (
    <div>
      <PageHeader title="Reportes y Business Intelligence" />

      <div className="grid g4" style={{marginBottom:'20px'}}>
        <KpiCard icon="fa-percent" value={loading?'–':`${kpi?.otif}%`} label="OTIF (entregas a tiempo)" color="green" />
        <KpiCard icon="fa-route" value={loading?'–':kpi?.totalViajes} label="Viajes totales" color="blue" />
        <KpiCard icon="fa-truck-ramp-box" value={loading?'–':`${kpi?.disponibilidadFlota}%`} label="Disponibilidad flota" color="teal" />
        <KpiCard icon="fa-gas-pump" value={loading?'–':`${(kpi?.litrosTotales||0).toLocaleString('es-AR')} L`} label="Litros consumidos" color="amber" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'kpi' && (
        <div className="grid g2" style={{gap:'20px'}}>
          <Card>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Indicadores operativos</div>
            {loading ? <div style={{color:'var(--text3)'}}>Cargando...</div> : (
              <>
                <Bar label="OTIF — Entregas a tiempo" value={parseFloat(kpi?.otif||0)} max={100} color="var(--green)" suffix="%" />
                <Bar label="Disponibilidad de flota" value={parseFloat(kpi?.disponibilidadFlota||0)} max={100} color="var(--teal)" suffix="%" />
                <div style={{marginTop:'20px',padding:'14px',background:'var(--bg3)',borderRadius:'10px'}}>
                  <div style={{fontSize:'12px',color:'var(--text3)',marginBottom:'8px',fontWeight:'500'}}>RESUMEN FINANCIERO</div>
                  <div style={{display:'flex',gap:'20px'}}>
                    <div><div style={{fontSize:'11px',color:'var(--text3)'}}>Costo combustible</div><div style={{fontSize:'16px',fontWeight:'300',color:'var(--amber)'}}>{formatCurrency(kpi?.costoCombustible)}</div></div>
                    <div><div style={{fontSize:'11px',color:'var(--text3)'}}>Viajes completados</div><div style={{fontSize:'16px',fontWeight:'300',color:'var(--green)'}}>{kpi?.totalViajes}</div></div>
                  </div>
                </div>
              </>
            )}
          </Card>
          <Card>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Cumplimiento de entregas</div>
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              {[
                { label:'A tiempo (OTIF)', pct: parseFloat(kpi?.otif||0), color:'var(--green)' },
                { label:'Con demora', pct: 100 - parseFloat(kpi?.otif||0), color:'var(--red)' },
              ].map(r => (
                <div key={r.label}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'6px'}}>
                    <span style={{color:'var(--text2)'}}>{r.label}</span>
                    <span style={{fontWeight:'500',color:r.color}}>{r.pct.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar" style={{height:'8px'}}><div className="progress-fill" style={{width:r.pct+'%',background:r.color}} /></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'clientes' && (
        <div className="grid g2" style={{gap:'20px'}}>
          <Card>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Rentabilidad por cliente</div>
            {loading ? <div style={{color:'var(--text3)'}}>Cargando...</div> : rentCliente.length ? (
              rentCliente.slice(0,8).map((r,i) => (
                <div key={r._id} style={{marginBottom:'14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'4px'}}>
                    <span style={{color:'var(--text)'}}>{r.razonSocial}</span>
                    <span style={{color:'var(--green)',fontFamily:'var(--mono)',fontWeight:'500'}}>{formatCurrency(r.rentabilidad)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'var(--text3)',marginBottom:'4px'}}>
                    <span>{r.viajes} viajes · margen {r.margen?.toFixed(1)}%</span>
                    <span>{formatCurrency(r.ingresos)} ingresos</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width:Math.min(100,r.margen||0)+'%',background: r.margen>30?'var(--green)':r.margen>15?'var(--accent)':'var(--amber)'}} /></div>
                </div>
              ))
            ) : <div style={{color:'var(--text3)',textAlign:'center',padding:'24px'}}>Sin datos de rentabilidad. Completar viajes para ver estadísticas.</div>}
          </Card>
          <Card>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Top clientes por viajes</div>
            {rentCliente.slice(0,5).map((r,i) => (
              <div key={r._id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:'24px',height:'24px',borderRadius:'50%',background:['var(--accent)','var(--green)','var(--amber)','var(--purple)','var(--teal)'][i],display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'600',color:'#fff',flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',color:'var(--text)'}}>{r.razonSocial}</div>
                  <div style={{fontSize:'11px',color:'var(--text3)'}}>{r.viajes} viajes</div>
                </div>
                <div style={{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--text2)'}}>{formatCurrency(r.ingresos)}</div>
              </div>
            ))}
            {!rentCliente.length && <div style={{color:'var(--text3)',textAlign:'center',padding:'24px'}}>Sin datos</div>}
          </Card>
        </div>
      )}

      {tab === 'combustible' && (
        <div className="grid g2" style={{gap:'20px'}}>
          <Card>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Resumen de combustible</div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {[
                { label:'Litros totales consumidos', value: `${(kpi?.litrosTotales||0).toLocaleString('es-AR')} L`, color:'var(--amber)' },
                { label:'Costo total combustible', value: formatCurrency(kpi?.costoCombustible), color:'var(--red)' },
                { label:'Costo por viaje (prom.)', value: kpi?.totalViajes ? formatCurrency((kpi.costoCombustible||0)/kpi.totalViajes) : '–', color:'var(--accent)' },
              ].map(r => (
                <div key={r.label} style={{padding:'12px',background:'var(--bg3)',borderRadius:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'13px',color:'var(--text2)'}}>{r.label}</span>
                  <span style={{fontSize:'16px',fontWeight:'500',color:r.color,fontFamily:'var(--mono)'}}>{r.value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>KPIs de eficiencia</div>
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <div style={{padding:'16px',background:'var(--accent-glow)',border:'1px solid var(--border2)',borderRadius:'10px',textAlign:'center'}}>
                <div style={{fontSize:'32px',fontWeight:'300',color:'var(--accent)'}}>{kpi?.otif}%</div>
                <div style={{fontSize:'12px',color:'var(--text2)'}}>OTIF — On Time In Full</div>
              </div>
              <div style={{padding:'16px',background:'var(--green-bg)',border:'1px solid var(--border2)',borderRadius:'10px',textAlign:'center'}}>
                <div style={{fontSize:'32px',fontWeight:'300',color:'var(--green)'}}>{kpi?.disponibilidadFlota}%</div>
                <div style={{fontSize:'12px',color:'var(--text2)'}}>Disponibilidad de flota</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
