import React, { useEffect, useState, useRef } from 'react';
import { alertasAPI, flotaAPI } from '../services/api';
import { PageHeader, Btn, Card, Badge, KpiCard, Toast } from '../components/common';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';

export default function TorrePage() {
  const [alertas, setAlertas] = useState([]);
  const [flota, setFlota] = useState([]);
  const [posiciones, setPosiciones] = useState({});
  const [mensajes, setMensajes] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();
  const msgRef = useRef(null);

  const { enviarMensaje, enviarPanico } = useSocket({
    onPosicion: (data) => {
      if (data.snapshot) {
        const map = {};
        data.data?.forEach(u => { map[u._id] = u.ultimaPosicion; });
        setPosiciones(prev => ({...prev, ...map}));
      } else {
        setPosiciones(prev => ({...prev, [data.vehiculoId]: { lat: data.lat, lng: data.lng, velocidad: data.velocidad }}));
      }
    },
    onAlerta: (alerta) => {
      setAlertas(prev => [alerta, ...prev]);
      addToast('Nueva alerta: ' + alerta.descripcion, 'error');
    },
    onPanico: (data) => {
      addToast('🚨 BOTÓN DE PÁNICO ACTIVADO', 'error');
      setAlertas(prev => [data, ...prev]);
    },
    onMensaje: (msg) => {
      setMensajes(prev => [...prev, msg]);
      setTimeout(() => msgRef.current?.scrollTo(0, 99999), 100);
    }
  });

  useEffect(() => {
    Promise.all([alertasAPI.getAll({ resuelta: false }), flotaAPI.getAll()])
      .then(([a, f]) => { setAlertas(a.data.data); setFlota(f.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const resolver = async (id) => {
    try { await alertasAPI.resolver(id, {}); setAlertas(prev => prev.map(a => a._id===id ? {...a, resuelta:true} : a)); addToast('Alerta resuelta'); }
    catch (e) { addToast('Error','error'); }
  };

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    enviarMensaje({ texto: msgInput, origen: 'Torre de Control', timestamp: new Date() });
    setMensajes(prev => [...prev, { texto: msgInput, origen: 'Torre', timestamp: new Date() }]);
    setMsgInput('');
  };

  const nivelColor = n => n==='critical'?'red':n==='warning'?'amber':'blue';
  const nivelIcon = t => ({ velocidad:'fa-gauge-max', desvio:'fa-road-barrier', panico:'fa-hand-point-up', vtv_vencida:'fa-file-circle-exclamation', retraso:'fa-clock', seguro_vencido:'fa-shield-exclamation' }[t]||'fa-triangle-exclamation');

  const enRuta = flota.filter(u=>u.estado==='en_ruta').length;
  const detenidos = flota.filter(u=>u.estado==='operativo').length;
  const alertasActivas = alertas.filter(a=>!a.resuelta);

  return (
    <div>
      <PageHeader title="Torre de Control">
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 6px var(--green)'}} />
          <span style={{fontSize:'12px',color:'var(--text3)'}}>Sistema activo</span>
        </div>
      </PageHeader>

      <div className="grid g4" style={{marginBottom:'20px'}}>
        <KpiCard icon="fa-truck" value={enRuta} label="En ruta" color="blue" />
        <KpiCard icon="fa-pause-circle" value={detenidos} label="Disponibles" color="green" />
        <KpiCard icon="fa-triangle-exclamation" value={alertasActivas.length} label="Alertas activas" color="red" />
        <KpiCard icon="fa-signal" value={`${flota.length > 0 ? Math.round((flota.filter(u=>u.gpsActivo).length/flota.length)*100) : 0}%`} label="GPS online" color="teal" />
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr 340px',gap:'20px'}}>
        {/* Mapa simulado */}
        <Card noPad>
          <div style={{padding:'16px 20px',fontSize:'13px',fontWeight:'500',color:'var(--text2)',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            Mapa de flota en vivo
            <div style={{display:'flex',gap:'8px'}}>
              <Badge color="blue">● En ruta ({enRuta})</Badge>
              <Badge color="amber">● Detenido ({flota.filter(u=>u.estado==='en_taller').length})</Badge>
              <Badge color="red">● Alerta ({alertasActivas.filter(a=>a.nivel==='critical').length})</Badge>
            </div>
          </div>
          <div style={{height:'440px',background:'var(--bg3)',position:'relative',margin:'12px',borderRadius:'10px',overflow:'hidden'}}>
            {/* Grid de mapa */}
            <div style={{position:'absolute',inset:0,opacity:.04,backgroundImage:'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)',backgroundSize:'40px 40px'}} />
            {/* Puntos de unidades simulados */}
            {flota.slice(0,10).map((u,i) => {
              const top = 15 + (i*7.5)%70;
              const left = 10 + (i*12.3)%80;
              const color = u.estado==='en_ruta' ? 'var(--accent)' : u.estado==='en_taller' ? 'var(--amber)' : 'var(--green)';
              const isAlert = alertasActivas.some(a=>a.vehiculo?._id===u._id||a.vehiculo===u._id);
              return (
                <div key={u._id} title={`${u.patente} — ${u.estado}`}
                  style={{ position:'absolute', top:`${top}%`, left:`${left}%`, width:'12px', height:'12px', borderRadius:'50%', background: isAlert?'var(--red)':color, cursor:'pointer', boxShadow:`0 0 0 3px ${isAlert?'var(--red)':color}33`, transition:'.3s' }}
                  onClick={() => addToast(`${u.patente}: ${u.marca} ${u.modelo} — ${u.estado}`, isAlert?'error':'info')}
                />
              );
            })}
            <div style={{position:'absolute',top:'12px',left:'12px',background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:'8px',padding:'8px 12px',fontSize:'11px'}}>
              <div style={{color:'var(--text2)',fontWeight:'500',marginBottom:'2px'}}>SEGUIMIENTO EN VIVO</div>
              <div style={{color:'var(--text3)'}}>Click en punto para ver detalles</div>
            </div>
          </div>
          {/* Lista de unidades */}
          <div style={{padding:'0 12px 12px'}}>
            <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'4px'}}>
              {flota.filter(u=>u.estado==='en_ruta').slice(0,6).map(u => (
                <div key={u._id} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'8px',padding:'8px 12px',flexShrink:0,cursor:'pointer'}} onClick={()=>addToast(`${u.patente}: en ruta`,'info')}>
                  <div style={{fontSize:'12px',fontWeight:'500',color:'var(--text)'}}>{u.patente}</div>
                  <div style={{fontSize:'10px',color:'var(--text3)'}}>{u.marca} {u.modelo}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {/* Alertas */}
          <Card>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              Alertas activas <Badge color="red">{alertasActivas.length}</Badge>
            </div>
            <div style={{maxHeight:'240px',overflowY:'auto'}}>
              {alertasActivas.slice(0,8).map(a => (
                <div key={a._id} className={`alert-item ${a.nivel}`} onClick={()=>resolver(a._id)}>
                  <div className={`act-icon kpi-${nivelColor(a.nivel)}`}><i className={`fa-solid ${nivelIcon(a.tipo)}`} /></div>
                  <div style={{flex:1}}>
                    <div className="alert-title" style={{fontSize:'12px'}}>{a.descripcion}</div>
                    <div className="alert-sub">{a.vehiculo?.patente} · {new Date(a.createdAt).toLocaleTimeString('es-AR')}</div>
                  </div>
                  <Btn size="sm" title="Resolver"><i className="fa-solid fa-check" /></Btn>
                </div>
              ))}
              {!alertasActivas.length && <div style={{textAlign:'center',color:'var(--text3)',padding:'20px',fontSize:'13px'}}><i className="fa-solid fa-check-circle" style={{color:'var(--green)',display:'block',fontSize:'24px',marginBottom:'8px'}} />Sin alertas</div>}
            </div>
          </Card>

          {/* Mensajería */}
          <Card style={{flex:1}}>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'12px'}}>Mensajería interna</div>
            <div ref={msgRef} style={{height:'180px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'6px',marginBottom:'10px'}}>
              {mensajes.map((m,i) => (
                <div key={i} style={{background:'var(--bg3)',borderRadius:'8px',padding:'8px 10px',fontSize:'12px'}}>
                  <div style={{color:'var(--text3)',fontSize:'10px',marginBottom:'2px'}}>{m.origen} · {new Date(m.timestamp).toLocaleTimeString('es-AR')}</div>
                  <div style={{color:'var(--text)'}}>{m.texto}</div>
                </div>
              ))}
              {!mensajes.length && <div style={{color:'var(--text3)',fontSize:'12px',textAlign:'center',padding:'20px'}}>Sin mensajes</div>}
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()}
                placeholder="Mensaje a toda la flota..." style={{flex:1,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'8px',padding:'7px 10px',color:'var(--text)',fontSize:'12px',outline:'none',fontFamily:'inherit'}} />
              <Btn variant="primary" size="sm" onClick={sendMsg}><i className="fa-solid fa-paper-plane" /></Btn>
            </div>
          </Card>
        </div>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
