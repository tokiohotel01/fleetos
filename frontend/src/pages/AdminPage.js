import React, { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import { PageHeader, Btn, Card, Badge, Table, Modal, FormGroup, Input, Select, Tabs, Toast } from '../components/common';
import { formatDateTime } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

const EMPTY = { nombre:'', email:'', password:'', rol:'logistica', sucursal:'Casa central' };
const ROL_COLOR = { administrador:'red', logistica:'blue', finanzas:'green', trafico:'amber', rrhh:'purple', chofer:'teal', cliente:'gray' };
const ROLES = [{ key:'administrador', label:'Administrador' },{ key:'logistica', label:'Logística' },{ key:'finanzas', label:'Finanzas' },{ key:'trafico', label:'Tráfico' },{ key:'rrhh', label:'Recursos Humanos' },{ key:'chofer', label:'Chofer' },{ key:'cliente', label:'Cliente' }];

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('usuarios');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [u, a] = await Promise.all([usersAPI.getAll(), usersAPI.getAuditoria()]);
      setUsers(u.data.data); setAuditoria(a.data.data);
    } catch (e) { addToast('Sin permisos de administrador','error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (u, e) => { e?.stopPropagation(); setSelected(u); setForm({ ...u, password:'' }); setModal(true); };

  const save = async () => {
    if (!form.nombre || !form.email) return addToast('Nombre y email requeridos','error');
    if (!selected && !form.password) return addToast('Contraseña requerida para nuevo usuario','error');
    setSaving(true);
    try {
      if (selected?._id) { await usersAPI.update(selected._id, form); addToast('Usuario actualizado'); }
      else { await usersAPI.create(form); addToast('Usuario creado'); }
      setModal(false); load();
    } catch (e) { addToast(e.response?.data?.message || 'Error','error'); }
    finally { setSaving(false); }
  };

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const TABS = [{ key:'usuarios', label:'Usuarios' },{ key:'roles', label:'Roles y permisos' },{ key:'empresa', label:'Empresa' },{ key:'auditoria', label:'Auditoría' }];

  return (
    <div>
      <PageHeader title="Administración del Sistema">
        {tab === 'usuarios' && <Btn variant="primary" onClick={openNew}><i className="fa-solid fa-plus" /> Nuevo usuario</Btn>}
      </PageHeader>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'usuarios' && (
        <Card noPad>
          <Table headers={['Usuario','Email','Rol','Sucursal','Último acceso','Estado','Acciones']} loading={loading}>
            {users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'600',color:'#fff',flexShrink:0}}>{u.nombre?.slice(0,2).toUpperCase()}</div>
                    <span style={{color:'var(--text)',fontWeight:'500'}}>{u.nombre}</span>
                  </div>
                </td>
                <td style={{fontFamily:'var(--mono)',fontSize:'12px'}}>{u.email}</td>
                <td><Badge color={ROL_COLOR[u.rol]||'gray'}>{u.rol}</Badge></td>
                <td>{u.sucursal}</td>
                <td style={{fontSize:'12px'}}>{u.ultimoAcceso ? formatDateTime(u.ultimoAcceso) : 'Nunca'}</td>
                <td><Badge color={u.activo?'green':'red'}>{u.activo?'Activo':'Inactivo'}</Badge></td>
                <td><Btn size="sm" onClick={e=>openEdit(u,e)}><i className="fa-solid fa-edit" /></Btn></td>
              </tr>
            ))}
            {!loading && users.length===0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}>Sin usuarios</td></tr>}
          </Table>
        </Card>
      )}

      {tab === 'roles' && (
        <div className="grid g3" style={{gap:'12px'}}>
          {ROLES.map(r => (
            <Card key={r.key}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                <div className={`kpi-icon kpi-${ROL_COLOR[r.key]||'gray'}`} style={{width:'32px',height:'32px',margin:0,fontSize:'13px'}}><i className="fa-solid fa-shield-halved" /></div>
                <span style={{fontWeight:'500'}}>{r.label}</span>
                <Badge color={ROL_COLOR[r.key]||'gray'}>{users.filter(u=>u.rol===r.key).length}</Badge>
              </div>
              <div style={{fontSize:'12px',color:'var(--text3)',lineHeight:'1.5'}}>
                {{ administrador:'Acceso total al sistema. Gestión de usuarios y configuración.', logistica:'Viajes, flota, choferes. Operaciones diarias.', finanzas:'Facturación, cobranzas, cuentas corrientes, caja.', trafico:'Torre de control, alertas GPS, seguimiento.', rrhh:'Legajos de choferes, licencias, psicofísicos.', chofer:'App móvil, viajes asignados, POD, navegación.', cliente:'Portal de seguimiento, historial de entregas.' }[r.key]}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'empresa' && (
        <Card style={{maxWidth:'600px'}}>
          <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Configuración de la empresa</div>
          <div className="form-row">
            <FormGroup label="Razón social"><Input defaultValue="FleetOS SRL" /></FormGroup>
            <FormGroup label="CUIT"><Input defaultValue="30-71234567-8" style={{fontFamily:'var(--mono)'}} /></FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Dirección"><Input defaultValue="Av. Gral. Paz 1234, CABA" /></FormGroup>
            <FormGroup label="Teléfono"><Input defaultValue="(011) 4521-8900" /></FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Email"><Input type="email" defaultValue="info@fleetos.com" /></FormGroup>
            <FormGroup label="Sitio web"><Input defaultValue="www.fleetos.com" /></FormGroup>
          </div>
          <Btn variant="primary" onClick={() => addToast('Configuración guardada')}><i className="fa-solid fa-save" /> Guardar cambios</Btn>
        </Card>
      )}

      {tab === 'auditoria' && (
        <Card noPad>
          <Table headers={['Fecha/Hora','Usuario','Acción','Módulo','IP']} loading={loading}>
            {auditoria.map(a => (
              <tr key={a._id}>
                <td style={{fontFamily:'var(--mono)',fontSize:'11px'}}>{formatDateTime(a.createdAt)}</td>
                <td style={{color:'var(--text)'}}>{a.nombreUsuario}</td>
                <td>{a.accion}</td>
                <td><Badge color="gray">{a.modulo}</Badge></td>
                <td style={{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--text3)'}}>{a.ip}</td>
              </tr>
            ))}
            {!loading && auditoria.length===0 && <tr><td colSpan={5} style={{textAlign:'center',padding:'48px',color:'var(--text3)'}}>Sin registros de auditoría</td></tr>}
          </Table>
        </Card>
      )}

      <Modal open={modal} title={selected?._id ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={()=>setModal(false)} onSave={save} saveDisabled={saving}>
        <div className="form-row">
          <FormGroup label="Nombre completo" required><Input value={form.nombre} onChange={e=>setF('nombre',e.target.value)} /></FormGroup>
          <FormGroup label="Email" required><Input type="email" value={form.email} onChange={e=>setF('email',e.target.value)} /></FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label={selected?._id ? 'Nueva contraseña (vacío = no cambiar)' : 'Contraseña'}>
            <Input type="password" value={form.password} onChange={e=>setF('password',e.target.value)} placeholder={selected?._id ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'} />
          </FormGroup>
          <FormGroup label="Rol">
            <Select value={form.rol} onChange={e=>setF('rol',e.target.value)}>
              {ROLES.map(r=><option key={r.key} value={r.key}>{r.label}</option>)}
            </Select>
          </FormGroup>
        </div>
        <div className="form-row">
          <FormGroup label="Sucursal"><Input value={form.sucursal} onChange={e=>setF('sucursal',e.target.value)} /></FormGroup>
          {selected?._id && (
            <FormGroup label="Estado">
              <Select value={form.activo?'true':'false'} onChange={e=>setF('activo',e.target.value==='true')}>
                <option value="true">Activo</option><option value="false">Inactivo</option>
              </Select>
            </FormGroup>
          )}
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
