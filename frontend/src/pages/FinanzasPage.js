import React, { useEffect, useState } from 'react';
import { finanzasAPI, clientesAPI, viajesAPI } from '../services/api';
import { PageHeader, Btn, Card, Badge, Table, Modal, FormGroup, Input, Select, KpiCard, Tabs, Toast } from '../components/common';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

const EMPTY_FACTURA = { cliente:'', total:'', tipo:'A', items:[{ descripcion:'Servicio de transporte', cantidad:1, precioUnitario:'', subtotal:'' }], notas:'' };

export default function FinanzasPage() {
  const [resumen, setResumen] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('facturas');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FACTURA);
  const [clientes, setClientes] = useState([]);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [r, f, c] = await Promise.all([finanzasAPI.getResumen(), finanzasAPI.getFacturas({ limit:30 }), clientesAPI.getAll({ limit:100 })]);
      setResumen(r.data.data); setFacturas(f.data.data); setClientes(c.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.cliente || !form.total) return addToast('Cliente y total son requeridos','error');
    setSaving(true);
    try {
      await finanzasAPI.crearFactura(form);
      addToast('Factura emitida'); setModal(false); load();
    } catch (e) { addToast(e.response?.data?.message || 'Error','error'); }
    finally { setSaving(false); }
  };

  const registrarPago = async (id) => {
    try { await finanzasAPI.registrarPago(id); addToast('Pago registrado','success'); load(); }
    catch (e) { addToast('Error al registrar pago','error'); }
  };

  const ESTADO_COLOR = { emitida:'blue', pagada:'green', vencida:'red', anulada:'gray' };
  const TABS = [{ key:'facturas', label:'Facturas' }, { key:'resumen', label:'Resumen financiero' }];
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div>
      <PageHeader title="Finanzas">
        <Btn variant="primary" onClick={()=>{ setForm(EMPTY_FACTURA); setModal(true); }}><i className="fa-solid fa-plus" /> Nueva factura</Btn>
      </PageHeader>

      <div className="grid g4" style={{marginBottom:'20px'}}>
        <KpiCard icon="fa-arrow-trend-up" value={formatCurrency(resumen?.ingresosMes)} label="Ingresos del mes" color="green" />
        <KpiCard icon="fa-file-invoice-dollar" value={resumen?.facturasMes ?? '–'} label="Facturas emitidas" color="blue" />
        <KpiCard icon="fa-hand-holding-dollar" value={formatCurrency(resumen?.cobradoMes)} label="Cobrado" color="teal" />
        <KpiCard icon="fa-clock-rotate-left" value={resumen?.facturasMorosas ?? '–'} label="Facturas vencidas" color="red" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'facturas' && (
        <Card noPad>
          <Table headers={['N° Factura','Tipo','Cliente','Total','Fecha emisión','Vencimiento','Estado','Acciones']} loading={loading}>
            {facturas.map(f => (
              <tr key={f._id}>
                <td style={{color:'var(--text)',fontWeight:'500',fontFamily:'var(--mono)',fontSize:'12px'}}>{f.numero}</td>
                <td><Badge color="gray">Tipo {f.tipo}</Badge></td>
                <td>{f.cliente?.razonSocial||'–'}</td>
                <td style={{fontFamily:'var(--mono)',fontSize:'12px',color:'var(--green)',fontWeight:'500'}}>{formatCurrency(f.total)}</td>
                <td>{formatDate(f.fechaEmision)}</td>
                <td>{formatDate(f.fechaVencimiento)}</td>
                <td><Badge color={ESTADO_COLOR[f.estado]||'gray'}>{f.estado}</Badge></td>
                <td>
                  {f.estado === 'emitida' && (
                    <Btn size="sm" variant="success" onClick={()=>registrarPago(f._id)}><i className="fa-solid fa-check" /> Cobrar</Btn>
                  )}
                </td>
              </tr>
            ))}
            {!loading && facturas.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}>Sin facturas</td></tr>}
          </Table>
        </Card>
      )}

      {tab === 'resumen' && (
        <div className="grid g2" style={{gap:'20px'}}>
          <Card>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Resumen del mes</div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {[
                { label:'Ingresos totales', value: formatCurrency(resumen?.ingresosMes), color:'var(--green)' },
                { label:'Total cobrado', value: formatCurrency(resumen?.cobradoMes), color:'var(--teal)' },
                { label:'Pendiente de cobro', value: formatCurrency((resumen?.ingresosMes||0)-(resumen?.cobradoMes||0)), color:'var(--amber)' },
              ].map(r => (
                <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'13px',color:'var(--text2)'}}>{r.label}</span>
                  <span style={{fontSize:'14px',fontWeight:'500',color:r.color,fontFamily:'var(--mono)'}}>{r.value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Estado de facturas</div>
            {['emitida','pagada','vencida','anulada'].map(e => {
              const count = facturas.filter(f=>f.estado===e).length;
              const pct = facturas.length ? Math.round(count/facturas.length*100) : 0;
              return (
                <div key={e} style={{marginBottom:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'4px'}}>
                    <span style={{color:'var(--text2)',textTransform:'capitalize'}}>{e}</span>
                    <span style={{color:'var(--text3)'}}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width:pct+'%',background:ESTADO_COLOR[e]==='green'?'var(--green)':ESTADO_COLOR[e]==='red'?'var(--red)':'var(--accent)'}} /></div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      <Modal open={modal} title="Nueva Factura" onClose={()=>setModal(false)} onSave={save} saveDisabled={saving}>
        <div className="form-row">
          <FormGroup label="Cliente" required>
            <Select value={form.cliente} onChange={e=>setF('cliente',e.target.value)}>
              <option value="">Seleccionar cliente</option>
              {clientes.map(c=><option key={c._id} value={c._id}>{c.razonSocial}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Tipo">
            <Select value={form.tipo} onChange={e=>setF('tipo',e.target.value)}>
              <option value="A">Factura A</option><option value="B">Factura B</option><option value="C">Factura C</option>
            </Select>
          </FormGroup>
        </div>
        <FormGroup label="Descripción del servicio">
          <Input value={form.items[0]?.descripcion} onChange={e=>setF('items',[{...form.items[0],descripcion:e.target.value}])} />
        </FormGroup>
        <div className="form-row">
          <FormGroup label="Subtotal (sin IVA)"><Input type="number" value={form.items[0]?.precioUnitario} onChange={e=>{ const v=Number(e.target.value); const iva=Math.round(v*.21); setF('items',[{...form.items[0],precioUnitario:v,subtotal:v}]); setF('subtotal',v); setF('iva',iva); setF('total',v+iva); }} /></FormGroup>
          <FormGroup label="Total (con IVA)"><Input type="number" value={form.total} readOnly style={{opacity:.7}} /></FormGroup>
        </div>
        <FormGroup label="Fecha de vencimiento"><Input type="date" value={form.fechaVencimiento||''} onChange={e=>setF('fechaVencimiento',e.target.value)} /></FormGroup>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
