import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { ROUTES, ROLE_HOME } from './lib/constants';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { CallCenter } from './pages/callcenter/CallCenter';
import { Sales } from './pages/sales/Sales';
import { Dentist } from './pages/dentist/Dentist';
import { Banko } from './pages/banko/Banko';
import { Admin } from './pages/admin/Admin';
import { PatientsPage } from './pages/records/PatientsPage';
import { AppointmentsPage } from './pages/records/AppointmentsPage';
import { LeadsPage } from './pages/records/LeadsPage';
import { TreatmentPage } from './pages/records/TreatmentPage';
import { InvoicesPage } from './pages/records/InvoicesPage';
import { UsersPage } from './pages/records/UsersPage';
import { VisitsPage } from './pages/records/VisitsPage';
import { ReportsPage } from './pages/records/ReportsPage';

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

  if (!isAuthenticated || !user) {
    return (
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  }

  const home = ROLE_HOME[user.role] || ROUTES.DASHBOARD;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <TopBar user={user} />
        <div className="flex">
          <Sidebar user={user} />
          <main className="flex-1 p-4 md:p-6 min-w-0">
            <Routes>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.CALL_CENTER} element={<CallCenter />} />
              <Route path={ROUTES.SALES} element={<Sales />} />
              <Route path={ROUTES.DENTIST} element={<Dentist />} />
              <Route path={ROUTES.BANKO} element={<Banko />} />
              <Route path={ROUTES.ADMIN} element={<Admin />} />
              <Route path={ROUTES.PATIENTS} element={<PatientsPage />} />
              <Route path={ROUTES.APPOINTMENTS} element={<AppointmentsPage />} />
              <Route path={ROUTES.LEADS} element={<LeadsPage />} />
              <Route path={ROUTES.TREATMENT} element={<TreatmentPage />} />
              <Route path={ROUTES.VISITS} element={<VisitsPage />} />
              <Route
                path={ROUTES.REPORTS}
                element={user.role === 'ADMIN' ? <ReportsPage /> : <Navigate to="/" replace />}
              />
              <Route
                path={ROUTES.INVOICES}
                element={['ADMIN', 'BANKO'].includes(user.role) ? <InvoicesPage /> : <Navigate to="/" replace />}
              />
              <Route
                path={ROUTES.USERS}
                element={user.role === 'ADMIN' ? <UsersPage /> : <Navigate to="/" replace />}
              />
              <Route path="/login" element={<Navigate to={home} replace />} />
              <Route path="*" element={<Navigate to={home} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
