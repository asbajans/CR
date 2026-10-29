import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { ROUTES, ROLE_DASHBOARD } from './lib/constants';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { CallCenter } from './pages/callcenter/CallCenter';
import { Sales } from './pages/sales/Sales';
import { Dentist } from './pages/dentist/Dentist';
import { Banko } from './pages/banko/Banko';
import { Admin } from './pages/admin/Admin';

const App = () => {
  const { user, token, setUser } = useAppStore();

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    const saved = localStorage.getItem('crdent_user');
    const savedToken = localStorage.getItem('crdent_token');
    if (saved && savedToken && !user) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed, savedToken);
      } catch {}
    }
  }, [user, setUser]);

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  }

  const allowedRoute = ROLE_DASHBOARD[user.role] || ROUTES.DASHBOARD;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <TopBar user={user} />
        <div className="flex">
          <Sidebar user={user} />
          <main className="flex-1 p-6">
            <Routes>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.CALL_CENTER} element={<CallCenter />} />
              <Route path={ROUTES.SALES} element={<Sales />} />
              <Route path={ROUTES.DENTIST} element={<Dentist />} />
              <Route path={ROUTES.BANKO} element={<Banko />} />
              <Route path={ROUTES.ADMIN} element={<Admin />} />
              <Route path="*" element={<Navigate to={allowedRoute} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
