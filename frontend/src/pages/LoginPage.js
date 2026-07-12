import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';

export default function LoginPage() {
  const [form, setForm] = useState({ email: 'admin@fleetos.com', password: 'admin123' });
  const { loading, error, token } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => { if (token) navigate('/dashboard'); }, [token]);
  useEffect(() => () => dispatch(clearError()), []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', backgroundImage:'radial-gradient(ellipse at 50% 0%, #4f7cff12 0%, transparent 60%)' }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'20px', padding:'36px', width:'380px', maxWidth:'95vw' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'28px' }}>
          <div style={{ width:'52px', height:'52px', background:'var(--accent)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px' }}>🚛</div>
          <div>
            <div style={{ fontSize:'22px', fontWeight:'600' }}>FleetOS</div>
            <div style={{ fontSize:'12px', color:'var(--text3)' }}>Transport Management System</div>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); dispatch(login(form)); }}>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'12px', fontWeight:'500', color:'var(--text2)', display:'block', marginBottom:'5px' }}>Email</label>
            <input style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'8px', padding:'9px 12px', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'inherit' }}
              type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'12px', fontWeight:'500', color:'var(--text2)', display:'block', marginBottom:'5px' }}>Contraseña</label>
            <input style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'8px', padding:'9px 12px', color:'var(--text)', fontSize:'13px', outline:'none', fontFamily:'inherit' }}
              type="password" value={form.password} onChange={set('password')} required />
          </div>

          {error && (
            <div style={{ background:'var(--red-bg)', border:'1px solid #ef444430', color:'var(--red)', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width:'100%', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'8px', padding:'10px', fontSize:'14px', fontWeight:'500', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity: loading ? .7 : 1, fontFamily:'inherit' }}>
            {loading ? <><span style={{display:'inline-block',width:'14px',height:'14px',border:'2px solid #fff4',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}} /> Ingresando...</> : <><i className="fa-solid fa-right-to-bracket" /> Ingresar</>}
          </button>
        </form>

        <div style={{ marginTop:'20px', padding:'12px', background:'var(--bg3)', borderRadius:'8px', fontSize:'11px', color:'var(--text3)', border:'1px solid var(--border)' }}>
          <strong style={{color:'var(--text2)'}}>Demo:</strong> admin@fleetos.com / admin123
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
