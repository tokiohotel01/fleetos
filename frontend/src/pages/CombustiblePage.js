import React, { useEffect, useState, useCallback } from 'react';
import { combustibleAPI, flotaAPI, choferesAPI } from '../services/api';
import { PageHeader, Btn, Card, Badge, Table, Modal, FormGroup, Input, Select, KpiCard, Toast } from '../components/common';
import { formatCurrency, formatDate, formatKm } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

const EMPTY = { vehiculo:'', chofer:'', litros:'', precioPorLitro:'', tipoCombustible:'gasoil', estacion:'', ciudad:'', kmActual:'', notas:'' };

export default function CombustiblePage() {
  const [data, setData] = useState([]);
  const [rend, setRend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [flota, setFlota] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [d, r, f, c] = await Promise.all([combustibleAPI.getAll(), combustibleAPI.rendimiento(), flotaAPI.getAll(), choferesAPI.getAll()]);
      setData(d.data.data); setRend(r.data.data); setFlota(f.data.data); setChoferes(c.data.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.vehiculo || !form.litros || !form.precioPorLitro) return addToast('Vehículo, litros y precio requeridos','error');
    setSaving(true);
    try { await combustibleAPI.create(form); addToast('Carga registrada'); setModal(false); load(); }
    catch (e) { addToast('Error al guardar','error'); }
    finally { setSaving(false); }
  };

  const totalLitros = data.reduce((s,d)=>s+(d.litros||0),0);
  const totalCosto = data.reduce((s,d)=>s+(d.total||0),0);
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div>
      <PageHeader title="Combustible y Peajes">
        <Btn variant="primary" onClick={()=>{ setForm(EMPTY); setModal(true); }}><i className="fa-solid fa-plus" /> Registrar carga</Btn>
      </PageHeader>

      <div className="grid g4" style={{marginBottom:'20px'}}>
        <KpiCard icon="fa-gas-pump" value={`${totalLitros.toLocaleString('es-AR')} L`} label="Litros totales" color="amber" />
        <KpiCard icon="fa-dollar-sign" value={formatCurrency(totalCosto)} label="Costo total" color="red" />
        <KpiCard icon="fa-gauge" value={data.length ? (totalLitros / data.length).toFixed(0) + ' L/carga' : '–'} label="Promedio por carga" color="blue" />
        <KpiCard icon="fa-truck" value={rend.length} label="Unidades con datos" color="teal" />
      </div>

      <div className="grid g2" style={{gap:'20px',marginBottom:'20px'}}>
        <Card noPad>
          <div style={{padding:'16px 20px',fontSize:'13px',fontWeight:'500',color:'var(--text2)',borderBottom:'1px solid var(--border)'}}>Cargas recientes</div>
          <Table headers={['Fecha','Unidad','Chofer','Litros','Precio/L','Total','Tipo']} loading={loading}>
            {data.slice(0,15).map(d => (
              <tr key={d._id}>
                <td>{formatDate(d.fecha)}</td>
                <td><Badge color="gray">{d.vehiculo?.patente||'–'}</Badge></td>
                <td>{d.chofer ? `${d.chofer.nombre} ${d.chofer.apellido}` : '–'}</td>
                <td style={{fontFamily:'var(--mono)',fontSize:'12px'}}>{d.litros} L</td>
                <td style={{fontFamily:'var(--mono)',fontSize:'12px'}}>{formatCurrency(d.precioPorLitro)}</td>
                <td style={{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--green)',fontWeight:'500'}}>{formatCurrency(d.total)}</td>
                <td><Badge color="blue">{d.tipoCombustible?.replace('_',' ')}</Badge></td>
              </tr>
            ))}
            {!loading && data.length===0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'32px',color:'var(--text3)'}}>Sin registros</td></tr>}
          </Table>
        </Card>

        <Card>
          <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Rendimiento por unidad</div>
          {rend.map(r => (
            <div key={r._id} style={{marginBottom:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'4px'}}>
                <span style={{color:'var(--text)'}}>{r.patente} <span style={{color:'var(--text3)'}}>{r.marca} {r.modelo}</span></span>
                <span style={{color:'var(--text3)',fontFamily:'var(--mono)'}}>{r.totalLitros?.toFixed(0)} L</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'var(--text3)',marginBottom:'4px'}}>
                <span>{r.cargas} cargas · {formatCurrency(r.totalCosto)}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{width:Math.min(100,(r.totalLitros/5000*100))+'%',background:'var(--amber)'}} /></div>
            </div>
          ))}
          {!rend.length && <div style={{color:'var(--text3)',fontSize:'13px',textAlign:'center',padding:'20px'}}>Sin datos de rendimiento</div>}
        </Card>
      </div>

      <Modal open={modal} title="Registrar Carga de Combustible" onClose={()=>setModal(false)} onSave={save} saveDisabled={saving}>
        <div className="form-row">
          <FormGroup label="Vehículo" required>
            <Select value={form.vehiculo} onChange={e=>setF('vehiculo',e.target.value)}>
              <option value="">Seleccionar</option>
              {flota.map(f=><option key={f._id} value={f._id}>{f.patente} — {f.marca} {f.modelo}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Chofer">
            <Select value={form.chofer} onChange={e=>setF('chofer',e.target.value)}>
              <option value="">Seleccionar</option>
              {choferes.map(c=><option key={c._id} value={c._id}>{c.nombre} {c.apellido}</option>)}
            </Select>
          </FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Litros" required><Input type="number" value={form.litros} onChange={e=>setF('litros',e.target.value)} placeholder="0" /></FormGroup>
          <FormGroup label="Precio por litro" required><Input type="number" value={form.precioPorLitro} onChange={e=>setF('precioPorLitro',e.target.value)} placeholder="0" /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Tipo">
            <Select value={form.tipoCombustible} onChange={e=>setF('tipoCombustible',e.target.value)}>
              <option value="gasoil">Gasoil</option><option value="gasoil_premium">Gasoil Premium</option><option value="nafta">Nafta</option><option value="gnc">GNC</option>
            </Select>
          </FormGroup>
          <FormGroup label="Estación"><Input value={form.estacion} onChange={e=>setF('estacion',e.target.value)} placeholder="YPF, Shell, Puma..." /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Ciudad"><Input value={form.ciudad} onChange={e=>setF('ciudad',e.target.value)} /></FormGroup>
          <FormGroup label="Km actual"><Input type="number" value={form.kmActual} onChange={e=>setF('kmActual',e.target.value)} /></FormGroup>
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
