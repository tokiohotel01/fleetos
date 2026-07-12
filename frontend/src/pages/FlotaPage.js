import React, { useEffect, useState, useCallback } from 'react';
import { flotaAPI } from '../services/api';
import { PageHeader, Btn, Card, Badge, Table, Modal, FormGroup, Input, Select, Tabs, KpiCard, SearchBar } from '../components/common';
import { estadoFlotaLabel, estadoFlotaColor, formatDate, formatKm, vencimientoColor, diasHasta } from '../utils/helpers';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/common';

const TIPOS = { camion:'Camión', semirremolque:'Semirremolque', equipo_frio:'Equipo de frío' };

const EMPTY = { patente:'', tipo:'camion', marca:'', modelo:'', anio:'', kmActuales:'', kmProximoService:'', capacidadToneladas:'', gpsImei:'', notas:'' };

export default function FlotaPage() {
  const [data, setData] = useState([]);
  const [venc, setVenc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('lista');
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (tipo) params.tipo = tipo;
      const [r, v] = await Promise.all([flotaAPI.getAll(params), flotaAPI.getVencimientos({ dias: 90 })]);
      setData(r.data.data); setVenc(v.data.data);
    } finally { setLoading(false); }
  }, [search, tipo]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (item, e) => { e.stopPropagation(); setSelected(item); setForm(item); setModal(true); };

  const save = async () => {
    if (!form.patente || !form.marca || !form.modelo) return addToast('Complete los campos requeridos','error');
    setSaving(true);
    try {
      if (selected) { await flotaAPI.update(selected._id, form); addToast('Unidad actualizada'); }
      else { await flotaAPI.create(form); addToast('Unidad creada'); }
      setModal(false); load();
    } catch (e) { addToast(e.response?.data?.message || 'Error','error'); }
    finally { setSaving(false); }
  };

  const counts = { operativo:0, en_ruta:0, en_taller:0, fuera_servicio:0 };
  data.forEach(u => { if (counts[u.estado] !== undefined) counts[u.estado]++; });
  const setF = (k,v) => setForm(f => ({...f,[k]:v}));

  const TABS = [{ key:'lista', label:'Unidades' }, { key:'vencimientos', label:`Vencimientos (${venc.length})` }];

  return (
    <div>
      <PageHeader title="Gestión de Flota">
        <Btn variant="primary" onClick={openNew}><i className="fa-solid fa-plus" /> Alta de unidad</Btn>
      </PageHeader>

      <div className="grid g4" style={{marginBottom:'20px'}}>
        <KpiCard icon="fa-truck" value={data.filter(u=>u.tipo==='camion').length} label="Camiones" color="blue" />
        <KpiCard icon="fa-trailer" value={data.filter(u=>u.tipo==='semirremolque').length} label="Semirremolques" color="teal" />
        <KpiCard icon="fa-snowflake" value={data.filter(u=>u.tipo==='equipo_frio').length} label="Equipos de frío" color="purple" />
        <KpiCard icon="fa-triangle-exclamation" value={venc.filter(v=>v.vencido).length} label="Vencidos" color="red" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'lista' && (
        <>
          <div className="filters-row">
            <SearchBar value={search} onChange={setSearch} placeholder="Patente, marca, modelo..." />
            <select className="filter" value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {Object.entries(TIPOS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <Card noPad>
            <Table headers={['Patente','Tipo','Marca / Modelo','Año','Km','Chofer','Estado','VTV','Seguro','Acciones']} loading={loading}>
              {data.map(u => (
                <tr key={u._id}>
                  <td style={{color:'var(--text)',fontWeight:'500'}}>{u.patente}</td>
                  <td><Badge color="gray">{TIPOS[u.tipo]||u.tipo}</Badge></td>
                  <td>{u.marca} {u.modelo}</td>
                  <td>{u.anio}</td>
                  <td style={{fontFamily:'var(--mono)',fontSize:'12px'}}>{formatKm(u.kmActuales)}</td>
                  <td>{u.choferAsignado ? `${u.choferAsignado.nombre} ${u.choferAsignado.apellido}` : <span style={{color:'var(--text3)'}}>–</span>}</td>
                  <td><Badge color={estadoFlotaColor(u.estado)}>{estadoFlotaLabel(u.estado)}</Badge></td>
                  <td>{(() => { const vtv = u.vencimientos?.find(v=>v.tipo==='VTV'); return vtv ? <Badge color={vencimientoColor(vtv.fechaVencimiento)}>{formatDate(vtv.fechaVencimiento)}</Badge> : <span style={{color:'var(--text3)'}}>–</span>; })()}</td>
                  <td>{(() => { const seg = u.vencimientos?.find(v=>v.tipo==='Seguro'); return seg ? <Badge color={vencimientoColor(seg.fechaVencimiento)}>{formatDate(seg.fechaVencimiento)}</Badge> : <span style={{color:'var(--text3)'}}>–</span>; })()}</td>
                  <td><Btn size="sm" onClick={e => openEdit(u,e)}><i className="fa-solid fa-edit" /></Btn></td>
                </tr>
              ))}
              {!loading && data.length===0 && <tr><td colSpan={10} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}>Sin unidades</td></tr>}
            </Table>
          </Card>
        </>
      )}

      {tab === 'vencimientos' && (
        <Card noPad>
          <Table headers={['Unidad','Tipo vencimiento','Vencimiento','Días restantes','Estado']} loading={loading}>
            {venc.map((v,i) => {
              const dias = diasHasta(v.fechaVencimiento);
              return (
                <tr key={i}>
                  <td style={{color:'var(--text)',fontWeight:'500'}}>{v.unidad?.patente} <span style={{color:'var(--text3)',fontWeight:'400'}}>{v.unidad?.marca} {v.unidad?.modelo}</span></td>
                  <td>{v.tipo}</td>
                  <td>{formatDate(v.fechaVencimiento)}</td>
                  <td style={{fontFamily:'var(--mono)',fontSize:'12px'}}>{v.vencido ? <span style={{color:'var(--red)'}}>Vencido</span> : `${dias} días`}</td>
                  <td><Badge color={vencimientoColor(v.fechaVencimiento)}>{v.vencido ? 'Vencido' : dias < 30 ? 'Urgente' : 'Próximo'}</Badge></td>
                </tr>
              );
            })}
            {!loading && venc.length===0 && <tr><td colSpan={5} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}>Sin vencimientos próximos ✓</td></tr>}
          </Table>
        </Card>
      )}

      <Modal open={modal} title={selected ? 'Editar Unidad' : 'Alta de Unidad'} onClose={() => setModal(false)} onSave={save} saveDisabled={saving}>
        <div className="form-row">
          <FormGroup label="Patente" required><Input value={form.patente} onChange={e=>setF('patente',e.target.value)} placeholder="AB 123 CD" /></FormGroup>
          <FormGroup label="Tipo" required>
            <Select value={form.tipo} onChange={e=>setF('tipo',e.target.value)}>
              {Object.entries(TIPOS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </Select>
          </FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Marca" required><Input value={form.marca} onChange={e=>setF('marca',e.target.value)} placeholder="Scania, Volvo..." /></FormGroup>
          <FormGroup label="Modelo" required><Input value={form.modelo} onChange={e=>setF('modelo',e.target.value)} placeholder="R450, FH500..." /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Año"><Input type="number" value={form.anio} onChange={e=>setF('anio',e.target.value)} placeholder="2024" /></FormGroup>
          <FormGroup label="Km actuales"><Input type="number" value={form.kmActuales} onChange={e=>setF('kmActuales',e.target.value)} placeholder="0" /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Capacidad (ton)"><Input type="number" value={form.capacidadToneladas} onChange={e=>setF('capacidadToneladas',e.target.value)} /></FormGroup>
          <FormGroup label="GPS IMEI"><Input value={form.gpsImei} onChange={e=>setF('gpsImei',e.target.value)} placeholder="IMEI del dispositivo" /></FormGroup>
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
