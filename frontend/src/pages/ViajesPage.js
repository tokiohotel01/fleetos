import React, { useEffect, useState, useCallback } from 'react';
import { viajesAPI, clientesAPI, flotaAPI, choferesAPI } from '../services/api';
import { PageHeader, Btn, Card, Badge, Table, Modal, FormGroup, Input, Select, Textarea, Tabs, SearchBar } from '../components/common';
import { estadoViajeLabel, estadoViajeColor, formatDate, formatCurrency } from '../utils/helpers';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/common';

const ESTADOS = ['pendiente','programado','en_carga','en_transito','en_descarga','finalizado','facturado','cancelado'];

const EMPTY_FORM = {
  cliente:'', vehiculo:'', chofer:'', semirremolque:'',
  origen:{ ciudad:'', provincia:'' }, destino:{ ciudad:'', provincia:'' },
  fechaSalida:'', fechaLlegadaEstimada:'',
  cargaDescripcion:'', cargaToneladas:'', tarifaAcordada:'',
  requiereRefrigeracion: false, temperatura:'', notas:''
};

export default function ViajesPage() {
  const [viajes, setViajes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('todos');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [estadoModal, setEstadoModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [flota, setFlota] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 30 };
      if (tab !== 'todos') params.estado = tab;
      if (search) params.search = search;
      const r = await viajesAPI.getAll(params);
      setViajes(r.data.data); setTotal(r.data.total);
    } finally { setLoading(false); }
  }, [tab, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    Promise.all([clientesAPI.getAll({ limit: 100 }), flotaAPI.getAll({ tipo:'camion' }), choferesAPI.getAll({ estado:'activo' })])
      .then(([c, f, ch]) => { setClientes(c.data.data); setFlota(f.data.data); setChoferes(ch.data.data); });
  }, []);

  const openNew = () => { setSelected(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (v, e) => { e.stopPropagation(); setSelected(v); setForm({ ...v, cliente: v.cliente?._id||v.cliente, vehiculo: v.vehiculo?._id||v.vehiculo, chofer: v.chofer?._id||v.chofer }); setModalOpen(true); };
  const openEstado = (v, e) => { e.stopPropagation(); setSelected(v); setEstadoModal(true); };

  const save = async () => {
    if (!form.cliente || !form.vehiculo || !form.chofer) return addToast('Complete cliente, vehículo y chofer', 'error');
    setSaving(true);
    try {
      if (selected) { await viajesAPI.update(selected._id, form); addToast('Viaje actualizado'); }
      else { await viajesAPI.create(form); addToast('Viaje creado'); }
      setModalOpen(false); load();
    } catch (e) { addToast(e.response?.data?.message || 'Error al guardar', 'error'); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (estado) => {
    try {
      await viajesAPI.cambiarEstado(selected._id, { estado });
      addToast('Estado actualizado');
      setEstadoModal(false); load();
    } catch (e) { addToast('Error al cambiar estado', 'error'); }
  };

  const TABS = [
    { key:'todos', label:`Todos (${total})` },
    { key:'pendiente', label:'Pendiente' },
    { key:'en_carga', label:'En carga' },
    { key:'en_transito', label:'En tránsito' },
    { key:'finalizado', label:'Finalizados' },
    { key:'facturado', label:'Facturados' },
  ];

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setNested = (parent, k, v) => setForm(f => ({ ...f, [parent]: { ...f[parent], [k]: v } }));

  return (
    <div>
      <PageHeader title="Gestión de Viajes">
        <Btn variant="primary" onClick={openNew}><i className="fa-solid fa-plus" /> Nuevo viaje</Btn>
      </PageHeader>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="filters-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por número, cliente..." />
      </div>

      <Card noPad>
        <Table headers={['N° Viaje','Cliente','Origen → Destino','Chofer','Unidad','Salida','ETA','Estado','Acciones']} loading={loading}>
          {viajes.map(v => (
            <tr key={v._id}>
              <td style={{color:'var(--text)',fontWeight:'500'}}>{v.numero}</td>
              <td>{v.cliente?.razonSocial || '–'}</td>
              <td style={{color:'var(--text)'}}>{v.origen?.ciudad} → {v.destino?.ciudad}</td>
              <td>{v.chofer ? `${v.chofer.nombre} ${v.chofer.apellido}` : '–'}</td>
              <td><Badge color="gray">{v.vehiculo?.patente || '–'}</Badge></td>
              <td>{formatDate(v.fechaSalida)}</td>
              <td>{formatDate(v.fechaLlegadaEstimada)}</td>
              <td><Badge color={estadoViajeColor(v.estado)}>{estadoViajeLabel(v.estado)}</Badge></td>
              <td>
                <div style={{display:'flex',gap:'6px'}}>
                  <Btn size="sm" onClick={e => openEstado(v,e)} title="Cambiar estado"><i className="fa-solid fa-arrows-rotate" /></Btn>
                  <Btn size="sm" onClick={e => openEdit(v,e)} title="Editar"><i className="fa-solid fa-edit" /></Btn>
                </div>
              </td>
            </tr>
          ))}
          {!loading && viajes.length === 0 && <tr><td colSpan={9} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}>Sin viajes encontrados</td></tr>}
        </Table>
      </Card>

      {/* Modal Nuevo/Editar */}
      <Modal open={modalOpen} title={selected ? 'Editar Viaje' : 'Nuevo Viaje'} onClose={() => setModalOpen(false)} onSave={save} saveDisabled={saving} size="lg">
        <div className="form-row">
          <FormGroup label="Cliente" required>
            <Select value={form.cliente} onChange={e => setF('cliente',e.target.value)}>
              <option value="">Seleccionar cliente</option>
              {clientes.map(c => <option key={c._id} value={c._id}>{c.razonSocial}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Tipo de carga">
            <Input value={form.cargaDescripcion} onChange={e => setF('cargaDescripcion',e.target.value)} placeholder="Descripción de la carga" />
          </FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Vehículo" required>
            <Select value={form.vehiculo} onChange={e => setF('vehiculo',e.target.value)}>
              <option value="">Seleccionar vehículo</option>
              {flota.map(f => <option key={f._id} value={f._id}>{f.patente} — {f.marca} {f.modelo}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Chofer" required>
            <Select value={form.chofer} onChange={e => setF('chofer',e.target.value)}>
              <option value="">Seleccionar chofer</option>
              {choferes.map(c => <option key={c._id} value={c._id}>{c.nombre} {c.apellido}</option>)}
            </Select>
          </FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Ciudad de origen">
            <Input value={form.origen?.ciudad} onChange={e => setNested('origen','ciudad',e.target.value)} placeholder="Ciudad" />
          </FormGroup>
          <FormGroup label="Ciudad de destino">
            <Input value={form.destino?.ciudad} onChange={e => setNested('destino','ciudad',e.target.value)} placeholder="Ciudad" />
          </FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Fecha de salida">
            <Input type="datetime-local" value={form.fechaSalida?.slice?.(0,16) || ''} onChange={e => setF('fechaSalida',e.target.value)} />
          </FormGroup>
          <FormGroup label="ETA estimado">
            <Input type="datetime-local" value={form.fechaLlegadaEstimada?.slice?.(0,16) || ''} onChange={e => setF('fechaLlegadaEstimada',e.target.value)} />
          </FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Toneladas">
            <Input type="number" value={form.cargaToneladas} onChange={e => setF('cargaToneladas',e.target.value)} placeholder="0" />
          </FormGroup>
          <FormGroup label="Tarifa acordada (ARS)">
            <Input type="number" value={form.tarifaAcordada} onChange={e => setF('tarifaAcordada',e.target.value)} placeholder="0" />
          </FormGroup>
        </div>
        <FormGroup label="Notas">
          <Textarea value={form.notas} onChange={e => setF('notas',e.target.value)} placeholder="Instrucciones especiales..." />
        </FormGroup>
      </Modal>

      {/* Modal Cambiar Estado */}
      <Modal open={estadoModal} title={`Cambiar estado — ${selected?.numero}`} onClose={() => setEstadoModal(false)}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          {ESTADOS.map(e => (
            <button key={e} onClick={() => cambiarEstado(e)}
              style={{ padding:'12px', borderRadius:'8px', border:`1px solid var(--border2)`, background: selected?.estado === e ? 'var(--accent-glow)' : 'var(--bg3)', color: selected?.estado === e ? 'var(--accent)' : 'var(--text2)', cursor:'pointer', fontSize:'13px', fontFamily:'inherit', transition:'.12s' }}>
              {estadoViajeLabel(e)}
            </button>
          ))}
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
