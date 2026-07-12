import React, { useEffect, useState, useCallback } from 'react';
import { clientesAPI } from '../services/api';
import { PageHeader, Btn, Card, Badge, Table, Modal, FormGroup, Input, Select, KpiCard, SearchBar, Toast } from '../components/common';
import { formatCurrency } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

const EMPTY = { razonSocial:'', cuit:'', condicionIVA:'Responsable Inscripto', ciudad:'', provincia:'', telefono:'', email:'', notas:'' };
const ESTADO_COLOR = { activo:'green', inactivo:'gray', moroso:'red' };

export default function ClientesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (estado) params.estado = estado;
      const r = await clientesAPI.getAll(params);
      setData(r.data.data);
    } finally { setLoading(false); }
  }, [search, estado]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c, e) => { e?.stopPropagation(); setSelected(c); setForm(c); setModal(true); };

  const save = async () => {
    if (!form.razonSocial || !form.cuit) return addToast('Razón social y CUIT requeridos','error');
    setSaving(true);
    try {
      if (selected?._id) { await clientesAPI.update(selected._id, form); addToast('Cliente actualizado'); }
      else { await clientesAPI.create(form); addToast('Cliente creado'); }
      setModal(false); load();
    } catch (e) { addToast(e.response?.data?.message || 'Error','error'); }
    finally { setSaving(false); }
  };

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div>
      <PageHeader title="Clientes">
        <Btn variant="primary" onClick={openNew}><i className="fa-solid fa-plus" /> Nuevo cliente</Btn>
      </PageHeader>

      <div className="grid g4" style={{marginBottom:'20px'}}>
        <KpiCard icon="fa-building" value={data.filter(c=>c.estado==='activo').length} label="Activos" color="blue" />
        <KpiCard icon="fa-circle-check" value={data.length} label="Total clientes" color="green" />
        <KpiCard icon="fa-triangle-exclamation" value={data.filter(c=>c.estado==='moroso').length} label="Morosos" color="red" />
        <KpiCard icon="fa-dollar-sign" value={formatCurrency(data.reduce((s,c)=>s+c.saldoCuentaCorriente,0))} label="Saldo total CC" color="amber" />
      </div>

      <div className="filters-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Razón social, CUIT..." />
        <select className="filter" value={estado} onChange={e=>setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="moroso">Morosos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <Card noPad>
        <Table headers={['Cliente','CUIT','Condición IVA','Contacto','CC Saldo','Estado','Acciones']} loading={loading}>
          {data.map(c => (
            <tr key={c._id}>
              <td>
                <div style={{color:'var(--text)',fontWeight:'500'}}>{c.razonSocial}</div>
                <div style={{fontSize:'11px',color:'var(--text3)'}}>{c.ciudad}</div>
              </td>
              <td style={{fontFamily:'var(--mono)',fontSize:'12px'}}>{c.cuit}</td>
              <td style={{fontSize:'12px'}}>{c.condicionIVA}</td>
              <td>{c.contactos?.[0]?.nombre || <span style={{color:'var(--text3)'}}>–</span>}</td>
              <td style={{fontFamily:'var(--mono)',fontSize:'12px',color:c.saldoCuentaCorriente>0?'var(--amber)':'var(--text2)'}}>{formatCurrency(c.saldoCuentaCorriente)}</td>
              <td><Badge color={ESTADO_COLOR[c.estado]||'gray'}>{c.estado}</Badge></td>
              <td>
                <div style={{display:'flex',gap:'6px'}}>
                  <Btn size="sm" onClick={e=>openEdit(c,e)}><i className="fa-solid fa-edit" /></Btn>
                </div>
              </td>
            </tr>
          ))}
          {!loading && data.length===0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}>Sin clientes</td></tr>}
        </Table>
      </Card>

      <Modal open={modal} title={selected?._id ? 'Editar Cliente' : 'Nuevo Cliente'} onClose={()=>setModal(false)} onSave={save} saveDisabled={saving}>
        <div className="form-row">
          <FormGroup label="Razón social" required><Input value={form.razonSocial} onChange={e=>setF('razonSocial',e.target.value)} /></FormGroup>
          <FormGroup label="CUIT" required><Input value={form.cuit} onChange={e=>setF('cuit',e.target.value)} placeholder="30-12345678-9" /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Condición IVA">
            <Select value={form.condicionIVA} onChange={e=>setF('condicionIVA',e.target.value)}>
              <option>Responsable Inscripto</option><option>Monotributista</option><option>Exento</option><option>Consumidor Final</option>
            </Select>
          </FormGroup>
          <FormGroup label="Email"><Input type="email" value={form.email} onChange={e=>setF('email',e.target.value)} /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Teléfono"><Input value={form.telefono} onChange={e=>setF('telefono',e.target.value)} /></FormGroup>
          <FormGroup label="Ciudad"><Input value={form.ciudad} onChange={e=>setF('ciudad',e.target.value)} /></FormGroup>
        </div>
        {selected?._id && (
          <FormGroup label="Estado">
            <Select value={form.estado} onChange={e=>setF('estado',e.target.value)}>
              <option value="activo">Activo</option><option value="moroso">Moroso</option><option value="inactivo">Inactivo</option>
            </Select>
          </FormGroup>
        )}
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
