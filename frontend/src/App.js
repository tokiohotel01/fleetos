import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ViajesPage from './pages/ViajesPage';
import FlotaPage from './pages/FlotaPage';
import ChoferesPage from './pages/ChoferesPage';
import ClientesPage from './pages/ClientesPage';
import FinanzasPage from './pages/FinanzasPage';
import CombustiblePage from './pages/CombustiblePage';
import MantenimientoPage from './pages/MantenimientoPage';
import TorrePage from './pages/TorrePage';
import ReportesPage from './pages/ReportesPage';
import AdminPage from './pages/AdminPage';
import DocumentosPage from './pages/DocumentosPage';

const PrivateRoute = ({ children }) => {
  const { token } = useSelector(s => s.auth);
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);
  useEffect(() => { if (token) dispatch(loadUser()); }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="torre"        element={<TorrePage />} />
          <Route path="viajes"       element={<ViajesPage />} />
          <Route path="flota"        element={<FlotaPage />} />
          <Route path="choferes"     element={<ChoferesPage />} />
          <Route path="clientes"     element={<ClientesPage />} />
          <Route path="finanzas"     element={<FinanzasPage />} />
          <Route path="combustible"  element={<CombustiblePage />} />
          <Route path="mantenimiento" element={<MantenimientoPage />} />
          <Route path="documentos"   element={<DocumentosPage />} />
          <Route path="reportes"     element={<ReportesPage />} />
          <Route path="admin"        element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
