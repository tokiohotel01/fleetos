import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './Layout.css';

const NAV = [
  { section: 'Principal', items: [
    { to: '/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
    { to: '/torre', icon: 'fa-satellite-dish', label: 'Torre de Control', badge: true },
  ]},
  { section: 'Operaciones', items: [
    { to: '/viajes', icon: 'fa-route', label: 'Viajes' },
    { to: '/flota', icon: 'fa-truck', label: 'Flota' },
    { to: '/choferes', icon: 'fa-id-card', label: 'Choferes' },
  ]},
  { section: 'Comercial', items: [
    { to: '/clientes', icon: 'fa-building', label: 'Clientes' },
    { to: '/finanzas', icon: 'fa-chart-line', label: 'Finanzas' },
  ]},
  { section: 'Recursos', items: [
    { to: '/combustible', icon: 'fa-gas-pump', label: 'Combustible' },
    { to: '/mantenimiento', icon: 'fa-wrench', label: 'Mantenimiento' },
    { to: '/documentos', icon: 'fa-file-contract', label: 'Documentos' },
  ]},
  { section: 'Análisis', items: [
    { to: '/reportes', icon: 'fa-chart-pie', label: 'Reportes y BI' },
    { to: '/admin', icon: 'fa-shield-halved', label: 'Administración' },
  ]},
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="logo">
          <div className="logo-icon">🚛</div>
          <div className="logo-text">
            <div className="logo-name">FleetOS</div>
            <div className="logo-sub">Transport Management</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(g => (
            <div key={g.section}>
              <div className="nav-section">{g.section}</div>
              {g.items.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <i className={`nav-icon fa-solid ${item.icon}`} />
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">!</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card" onClick={() => { dispatch(logout()); navigate('/login'); }}>
            <div className="avatar">{user?.nombre?.slice(0,2).toUpperCase() || 'US'}</div>
            <div className="user-info">
              <div className="user-name">{user?.nombre}</div>
              <div className="user-role">{user?.rol}</div>
            </div>
            <i className="fa-solid fa-right-from-bracket logout-icon" style={{color:'var(--text3)',fontSize:'11px'}} />
          </div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setCollapsed(c => !c)}>
            <i className="fa-solid fa-bars" />
          </button>
          <div className="topbar-spacer" />
          <div className="topbar-actions">
            <button className="icon-btn notif-btn"><i className="fa-solid fa-bell" /></button>
            <button className="icon-btn"><i className="fa-solid fa-magnifying-glass" /></button>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
