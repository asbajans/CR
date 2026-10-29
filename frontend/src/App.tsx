import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
  const { user, token } = useAppStore();
  const location = useLocation();

  const isAuthenticated = !!token && !!user;
  const allowedRoute = isAuthenticated ? ROLE_DASHBOARD[user.role] : ROUTES.LOGIN;

  if (!isAuthenticated && location.pathname !== ROUTES.LOGIN) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && (
          <>
            <TopBar user={user!} />
            <div className="flex">
              <Sidebar user={user!} />
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
          </>
        )}
        {!isAuthenticated && <Login />}
      </div>
    </BrowserRouter>
  );
};

export default App;
