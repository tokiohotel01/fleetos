import React, { useEffect, useState, useCallback } from 'react';
import { mantenimientoAPI, flotaAPI } from '../services/api';
import { PageHeader, Btn, Card, Badge, Table, Modal, FormGroup, Input, Select, Textarea, KpiCard, Tabs, Toast } from '../components/common';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

const EMPTY = { vehiculo:'', tipo:'correctivo', taller:'propio', nombreTaller:'', descripcion:'', costoManoObra:'', fechaEgresoEstimada:'', notas:'' };
const ESTADO_COLOR = { abierta:'amber', en_proceso:'blue', finalizada:'green', cancelada:'red' };

export default function MantenimientoPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('activas');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [flota, setFlota] = useState([]);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab === 'activas') params.estado = 'abierta,en_proceso';
      if (tab === 'finalizadas') params.estado = 'finalizada';
      const [d, f] = await Promise.all([mantenimientoAPI.getAll(params), flotaAPI.getAll()]);
      setData(d.data.data); setFlota(f.data.data);
    } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (item, e) => { e?.stopPropagation(); setSelected(item); setForm(item); setModal(true); };

  const save = async () => {
    if (!form.vehiculo || !form.descripcion) return addToast('Vehículo y descripción requeridos','error');
    setSaving(true);
    try {
      if (selected?._id) { await mantenimientoAPI.update(selected._id, form); addToast('OT actualizada'); }
      else { await mantenimientoAPI.create(form); addToast('OT creada'); }
      setModal(false); load();
    } catch (e) { addToast(e.response?.data?.message || 'Error','error'); }
    finally { setSaving(false); }
  };

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const TABS = [{ key:'activas', label:'Activas' }, { key:'finalizadas', label:'Finalizadas' }, { key:'todos', label:'Todas' }];
  const totalCosto = data.reduce((s,d)=>s+(d.costoTotal||0),0);

  return (
    <div>
      <PageHeader title="Mantenimiento">
        <Btn variant="primary" onClick={openNew}><i className="fa-solid fa-plus" /> Nueva OT</Btn>
      </PageHeader>

      <div className="grid g4" style={{marginBottom:'20px'}}>
        <KpiCard icon="fa-wrench" value={data.filter(d=>d.estado==='en_proceso').length} label="En proceso" color="amber" />
        <KpiCard icon="fa-circle-check" value={data.filter(d=>d.estado==='finalizada').length} label="Finalizadas" color="green" />
        <KpiCard icon="fa-calendar" value={data.filter(d=>d.tipo==='preventivo').length} label="Preventivos" color="blue" />
        <KpiCard icon="fa-dollar-sign" value={formatCurrency(totalCosto)} label="Costo total" color="red" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <Card noPad>
        <Table headers={['N° OT','Unidad','Tipo','Taller','Descripción','Ingreso','Est. Egreso','Costo','Estado','Acciones']} loading={loading}>
          {data.map(d => (
            <tr key={d._id}>
              <td style={{color:'var(--text)',fontWeight:'500',fontFamily:'var(--mono)',fontSize:'12px'}}>{d.numero}</td>
              <td><Badge color="gray">{d.vehiculo?.patente||'–'}</Badge></td>
              <td style={{fontSize:'12px'}}>{d.tipo}</td>
              <td><Badge color={d.taller==='propio'?'blue':'purple'}>{d.taller}</Badge></td>
              <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.descripcion}</td>
              <td>{formatDate(d.fechaIngreso)}</td>
              <td>{formatDate(d.fechaEgresoEstimada)}</td>
              <td style={{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--text)'}}>{formatCurrency(d.costoTotal)}</td>
              <td><Badge color={ESTADO_COLOR[d.estado]||'gray'}>{d.estado}</Badge></td>
              <td>
                <div style={{display:'flex',gap:'6px'}}>
                  <Btn size="sm" onClick={e=>openEdit(d,e)}><i className="fa-solid fa-edit" /></Btn>
                  {d.estado === 'en_proceso' && (
                    <Btn size="sm" variant="success" onClick={async e=>{ e.stopPropagation(); await mantenimientoAPI.update(d._id,{estado:'finalizada',fechaEgresoReal:new Date()}); addToast('OT finalizada'); load(); }}><i className="fa-solid fa-check" /></Btn>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {!loading && data.length===0 && <tr><td colSpan={10} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}>Sin órdenes de trabajo</td></tr>}
        </Table>
      </Card>

      <Modal open={modal} title={selected?._id ? 'Editar OT' : 'Nueva Orden de Trabajo'} onClose={()=>setModal(false)} onSave={save} saveDisabled={saving} size="lg">
        <div className="form-row">
          <FormGroup label="Vehículo" required>
            <Select value={form.vehiculo?._id||form.vehiculo} onChange={e=>setF('vehiculo',e.target.value)}>
              <option value="">Seleccionar</option>
              {flota.map(f=><option key={f._id} value={f._id}>{f.patente} — {f.marca} {f.modelo}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Tipo">
            <Select value={form.tipo} onChange={e=>setF('tipo',e.target.value)}>
              <option value="preventivo">Preventivo</option><option value="correctivo">Correctivo</option>
              <option value="service">Service</option><option value="neumaticos">Neumáticos</option><option value="otros">Otros</option>
            </Select>
          </FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Taller">
            <Select value={form.taller} onChange={e=>setF('taller',e.target.value)}>
              <option value="propio">Taller propio</option><option value="externo">Taller externo</option>
            </Select>
          </FormGroup>
          <FormGroup label="Nombre del taller"><Input value={form.nombreTaller} onChange={e=>setF('nombreTaller',e.target.value)} placeholder="Nombre o razón social" /></FormGroup>
        </div>
        <FormGroup label="Descripción del trabajo" required>
          <Textarea value={form.descripcion} onChange={e=>setF('descripcion',e.target.value)} placeholder="Detalle del mantenimiento o reparación..." />
        </FormGroup>
        <div className="form-row">
          <FormGroup label="Costo mano de obra"><Input type="number" value={form.costoManoObra} onChange={e=>setF('costoManoObra',e.target.value)} /></FormGroup>
          <FormGroup label="Fecha est. de egreso"><Input type="date" value={form.fechaEgresoEstimada?.slice?.(0,10)||''} onChange={e=>setF('fechaEgresoEstimada',e.target.value)} /></FormGroup>
        </div>
        {selected?._id && (
          <FormGroup label="Estado">
            <Select value={form.estado} onChange={e=>setF('estado',e.target.value)}>
              <option value="abierta">Abierta</option><option value="en_proceso">En proceso</option><option value="finalizada">Finalizada</option><option value="cancelada">Cancelada</option>
            </Select>
          </FormGroup>
        )}
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
