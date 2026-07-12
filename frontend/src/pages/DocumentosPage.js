import React, { useState } from 'react';
import { PageHeader, Btn, Card, Badge, Toast } from '../components/common';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

export default function DocumentosPage() {
  const [uploading, setUploading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post('/documentos/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast('Archivo subido: ' + r.data.nombre);
    } catch (err) { addToast('Error al subir archivo','error'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const docs = [
    { icon:'fa-file-lines', label:'Cartas de porte', count:842, color:'blue' },
    { icon:'fa-receipt', label:'Remitos', count:1204, color:'teal' },
    { icon:'fa-globe', label:'CMR Internacionales', count:148, color:'purple' },
    { icon:'fa-signature', label:'POD firmados', count:798, color:'green' },
    { icon:'fa-camera', label:'Fotos de entrega', count:3412, color:'amber' },
    { icon:'fa-folder-open', label:'Archivo digital', count:6404, color:'red' },
  ];

  return (
    <div>
      <PageHeader title="Gestión Documental">
        <label style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer',background:'var(--accent)',color:'#fff',border:'none',transition:'.12s'}}>
          {uploading ? <><span className="spinner" style={{borderTopColor:'#fff'}} /> Subiendo...</> : <><i className="fa-solid fa-upload" /> Subir documento</>}
          <input type="file" style={{display:'none'}} onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
        </label>
      </PageHeader>

      <div className="grid g3" style={{marginBottom:'20px'}}>
        {docs.map(d => (
          <Card key={d.label} style={{cursor:'pointer'}} onClick={() => addToast(`Módulo: ${d.label}`,'info')}>
            <div className={`kpi-icon kpi-${d.color}`}><i className={`fa-solid ${d.icon}`} /></div>
            <div className="kpi-value" style={{fontSize:'22px'}}>{d.count.toLocaleString('es-AR')}</div>
            <div className="card-label">{d.label}</div>
            <div className="card-sub" style={{marginTop:'6px'}}>↗ Ver todos</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text2)',marginBottom:'16px'}}>Documentos recientes</div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[
            { nombre:'Carta de porte VJ-2847.pdf', tipo:'Carta de porte', fecha:'06/06/2026', viaje:'VJ-2847' },
            { nombre:'POD_Molinos_06062026.pdf', tipo:'POD', fecha:'06/06/2026', viaje:'VJ-2845' },
            { nombre:'Remito_Arcor_001234.pdf', tipo:'Remito', fecha:'05/06/2026', viaje:'VJ-2840' },
            { nombre:'Foto_entrega_VJ2848_01.jpg', tipo:'Foto', fecha:'05/06/2026', viaje:'VJ-2848' },
          ].map((d,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:'14px',padding:'10px 14px',background:'var(--bg3)',borderRadius:'10px',border:'1px solid var(--border)',cursor:'pointer',transition:'.12s'}}
              onClick={() => addToast('Abriendo: ' + d.nombre,'info')}>
              <div style={{width:'36px',height:'36px',borderRadius:'8px',background:'var(--accent-glow)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>
                {d.nombre.endsWith('.pdf') ? '📄' : '🖼️'}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',color:'var(--text)',fontWeight:'500'}}>{d.nombre}</div>
                <div style={{fontSize:'11px',color:'var(--text3)'}}>{d.fecha} · Viaje {d.viaje}</div>
              </div>
              <Badge color="blue">{d.tipo}</Badge>
              <Btn size="sm"><i className="fa-solid fa-download" /></Btn>
            </div>
          ))}
        </div>
      </Card>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
