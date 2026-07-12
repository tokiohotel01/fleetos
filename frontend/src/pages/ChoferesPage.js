import React, { useEffect, useState, useCallback } from 'react';
import { choferesAPI } from '../services/api';
import { PageHeader, Btn, Card, Badge, Table, Modal, FormGroup, Input, Select, KpiCard, Tabs, SearchBar, Toast } from '../components/common';
import { formatDate, vencimientoColor, diasHasta } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

const EMPTY = { nombre:'', apellido:'', dni:'', cuil:'', telefono:'', email:'', ciudad:'', provincia:'', notas:'' };
const ESTADO_COLOR = { activo:'green', en_viaje:'blue', licencia:'amber', suspendido:'red', inactivo:'gray' };
const ESTADO_LABEL = { activo:'Activo', en_viaje:'En viaje', licencia:'Licencia', suspendido:'Suspendido', inactivo:'Inactivo' };

export default function ChoferesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('activos');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [detModal, setDetModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab !== 'todos') params.estado = tab === 'activos' ? undefined : tab;
      if (search) params.search = search;
      if (tab === 'activos') params.estado = 'activo,en_viaje';
      const r = await choferesAPI.getAll(params);
      setData(r.data.data);
    } finally { setLoading(false); }
  }, [tab, search]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c, e) => { e?.stopPropagation(); setSelected(c); setForm(c); setModal(true); };
  const openDet = (c) => { setSelected(c); setDetModal(true); };

  const save = async () => {
    if (!form.nombre || !form.apellido || !form.dni) return addToast('Nombre, apellido y DNI son requeridos','error');
    setSaving(true);
    try {
      if (selected?._id) { await choferesAPI.update(selected._id, form); addToast('Chofer actualizado'); }
      else { await choferesAPI.create(form); addToast('Chofer dado de alta'); }
      setModal(false); load();
    } catch (e) { addToast(e.response?.data?.message || 'Error','error'); }
    finally { setSaving(false); }
  };

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const TABS = [{ key:'activos', label:'Activos' }, { key:'todos', label:'Todos' }, { key:'suspendido', label:'Suspendidos' }];

  const counts = { activo:0, en_viaje:0, suspendido:0 };
  data.forEach(c => { if (counts[c.estado] !== undefined) counts[c.estado]++; });

  return (
    <div>
      <PageHeader title="Choferes">
        <Btn variant="primary" onClick={openNew}><i className="fa-solid fa-plus" /> Nuevo chofer</Btn>
      </PageHeader>

      <div className="grid g4" style={{marginBottom:'20px'}}>
        <KpiCard icon="fa-circle-check" value={data.filter(c=>c.estado==='activo').length} label="Disponibles" color="green" />
        <KpiCard icon="fa-route" value={data.filter(c=>c.estado==='en_viaje').length} label="En viaje" color="blue" />
        <KpiCard icon="fa-ban" value={data.filter(c=>c.estado==='suspendido').length} label="Suspendidos" color="red" />
        <KpiCard icon="fa-id-card" value={data.length} label="Total" color="teal" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="filters-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Nombre, apellido, DNI..." />
      </div>

      <Card noPad>
        <Table headers={['Chofer','DNI / CUIL','Licencia','Psicofísico','Unidad','Viajes','Estado','Acciones']} loading={loading}>
          {data.map(c => {
            const lic = c.licencias?.[0];
            const psico = c.psicofisicos?.[0];
            return (
              <tr key={c._id} onClick={() => openDet(c)}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'600',color:'#fff',flexShrink:0}}>
                      {c.nombre[0]}{c.apellido[0]}
                    </div>
                    <div>
                      <div style={{color:'var(--text)',fontWeight:'500'}}>{c.nombre} {c.apellido}</div>
                      <div style={{fontSize:'11px',color:'var(--text3)'}}>{c.ciudad}</div>
                    </div>
                  </div>
                </td>
                <td style={{fontFamily:'var(--mono)',fontSize:'12px'}}>{c.dni}</td>
                <td>{lic ? <Badge color={vencimientoColor(lic.vencimiento)}>Clase {lic.categoria} · {formatDate(lic.vencimiento)}</Badge> : <span style={{color:'var(--text3)'}}>–</span>}</td>
                <td>{psico ? <Badge color={psico.resultado==='apto'?'green':'red'}>{formatDate(psico.vencimiento)}</Badge> : <span style={{color:'var(--text3)'}}>–</span>}</td>
                <td>{c.unidadAsignada ? <Badge color="gray">{c.unidadAsignada.patente}</Badge> : <span style={{color:'var(--text3)'}}>–</span>}</td>
                <td style={{fontFamily:'var(--mono)',fontSize:'12px'}}>{c.totalViajes}</td>
                <td><Badge color={ESTADO_COLOR[c.estado]||'gray'}>{ESTADO_LABEL[c.estado]||c.estado}</Badge></td>
                <td>
                  <div style={{display:'flex',gap:'6px'}}>
                    <Btn size="sm" onClick={e=>{e.stopPropagation();openDet(c)}}><i className="fa-solid fa-folder-open" /></Btn>
                    <Btn size="sm" onClick={e=>openEdit(c,e)}><i className="fa-solid fa-edit" /></Btn>
                  </div>
                </td>
              </tr>
            );
          })}
          {!loading && data.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}>Sin choferes encontrados</td></tr>}
        </Table>
      </Card>

      {/* Modal Alta/Editar */}
      <Modal open={modal} title={selected?._id ? 'Editar Chofer' : 'Alta de Chofer'} onClose={()=>setModal(false)} onSave={save} saveDisabled={saving}>
        <div className="form-row">
          <FormGroup label="Nombre" required><Input value={form.nombre} onChange={e=>setF('nombre',e.target.value)} /></FormGroup>
          <FormGroup label="Apellido" required><Input value={form.apellido} onChange={e=>setF('apellido',e.target.value)} /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="DNI" required><Input value={form.dni} onChange={e=>setF('dni',e.target.value)} placeholder="12.345.678" /></FormGroup>
          <FormGroup label="CUIL" required><Input value={form.cuil} onChange={e=>setF('cuil',e.target.value)} placeholder="20-12345678-9" /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Teléfono"><Input value={form.telefono} onChange={e=>setF('telefono',e.target.value)} /></FormGroup>
          <FormGroup label="Email"><Input type="email" value={form.email} onChange={e=>setF('email',e.target.value)} /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Ciudad"><Input value={form.ciudad} onChange={e=>setF('ciudad',e.target.value)} /></FormGroup>
          <FormGroup label="Provincia"><Input value={form.provincia} onChange={e=>setF('provincia',e.target.value)} /></FormGroup>
        </div>
        {selected?._id && (
          <FormGroup label="Estado">
            <Select value={form.estado} onChange={e=>setF('estado',e.target.value)}>
              <option value="activo">Activo</option>
              <option value="licencia">Licencia</option>
              <option value="suspendido">Suspendido</option>
              <option value="inactivo">Inactivo</option>
            </Select>
          </FormGroup>
        )}
      </Modal>

      {/* Legajo Modal */}
      <Modal open={detModal} title={`Legajo — ${selected?.nombre} ${selected?.apellido}`} onClose={()=>setDetModal(false)} size="lg">
        {selected && (
          <div>
            <div className="form-row" style={{marginBottom:'16px'}}>
              <div><div style={{fontSize:'11px',color:'var(--text3)'}}>DNI</div><div style={{fontFamily:'var(--mono)'}}>{selected.dni}</div></div>
              <div><div style={{fontSize:'11px',color:'var(--text3)'}}>CUIL</div><div style={{fontFamily:'var(--mono)'}}>{selected.cuil}</div></div>
              <div><div style={{fontSize:'11px',color:'var(--text3)'}}>Teléfono</div><div>{selected.telefono||'–'}</div></div>
              <div><div style={{fontSize:'11px',color:'var(--text3)'}}>Ciudad</div><div>{selected.ciudad||'–'}</div></div>
            </div>
            <div style={{marginBottom:'16px'}}>
              <div style={{fontSize:'12px',fontWeight:'500',color:'var(--text2)',marginBottom:'8px'}}>LICENCIAS</div>
              {selected.licencias?.length ? selected.licencias.map((l,i) => (
                <div key={i} style={{display:'flex',gap:'12px',padding:'8px 12px',background:'var(--bg3)',borderRadius:'8px',marginBottom:'6px',fontSize:'13px'}}>
                  <span>Clase {l.categoria}</span>
                  <span style={{color:'var(--text3)'}}>N°: {l.numero}</span>
                  <Badge color={vencimientoColor(l.vencimiento)}>Vence: {formatDate(l.vencimiento)}</Badge>
                </div>
              )) : <div style={{color:'var(--text3)',fontSize:'13px'}}>Sin licencias registradas</div>}
            </div>
            <div style={{marginBottom:'16px'}}>
              <div style={{fontSize:'12px',fontWeight:'500',color:'var(--text2)',marginBottom:'8px'}}>PSICOFÍSICOS</div>
              {selected.psicofisicos?.length ? selected.psicofisicos.map((p,i) => (
                <div key={i} style={{display:'flex',gap:'12px',padding:'8px 12px',background:'var(--bg3)',borderRadius:'8px',marginBottom:'6px',fontSize:'13px'}}>
                  <Badge color={p.resultado==='apto'?'green':'red'}>{p.resultado}</Badge>
                  <span style={{color:'var(--text3)'}}>Vence: {formatDate(p.vencimiento)}</span>
                  {p.medico && <span style={{color:'var(--text3)'}}>{p.medico}</span>}
                </div>
              )) : <div style={{color:'var(--text3)',fontSize:'13px'}}>Sin exámenes registrados</div>}
            </div>
            {selected.sanciones?.length > 0 && (
              <div>
                <div style={{fontSize:'12px',fontWeight:'500',color:'var(--text2)',marginBottom:'8px'}}>SANCIONES</div>
                {selected.sanciones.map((s,i) => (
                  <div key={i} style={{padding:'8px 12px',background:'var(--red-bg)',border:'1px solid #ef444430',borderRadius:'8px',marginBottom:'6px',fontSize:'13px'}}>
                    <Badge color="red">{s.tipo}</Badge>
                    <span style={{marginLeft:'8px',color:'var(--text2)'}}>{s.descripcion}</span>
                    <span style={{color:'var(--text3)',marginLeft:'8px'}}>{formatDate(s.fecha)}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:'flex',gap:'16px',marginTop:'8px',padding:'12px',background:'var(--bg3)',borderRadius:'8px',fontSize:'13px'}}>
              <div><span style={{color:'var(--text3)'}}>Total viajes: </span><strong>{selected.totalViajes}</strong></div>
              <div><span style={{color:'var(--text3)'}}>Km totales: </span><strong>{selected.kmTotales?.toLocaleString('es-AR')} km</strong></div>
            </div>
          </div>
        )}
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
