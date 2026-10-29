import React from 'react';
import { useAppStore } from '../../store/appStore';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/constants';

type NavItem = { label: string; path: string; icon: string };

const common: Record<string, NavItem[]> = {
  ADMIN: [
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Gelişler', path: ROUTES.VISITS, icon: '🪪' },
    { label: 'Leadler', path: ROUTES.LEADS, icon: '📞' },
    { label: 'Tedavi Planları', path: ROUTES.TREATMENT, icon: '📋' },
    { label: 'Faturalar', path: ROUTES.INVOICES, icon: '💳' },
    { label: 'Raporlar', path: ROUTES.REPORTS, icon: '📈' },
    { label: 'Ayarlar', path: ROUTES.SETTINGS, icon: '⚙️' },
  ],
  CALL_CENTER: [
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Gelişler', path: ROUTES.VISITS, icon: '🪪' },
    { label: 'Leadler', path: ROUTES.LEADS, icon: '📞' },
  ],
  SALES: [
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Gelişler', path: ROUTES.VISITS, icon: '🪪' },
    { label: 'Leadler', path: ROUTES.LEADS, icon: '📞' },
    { label: 'Tedavi Planları', path: ROUTES.TREATMENT, icon: '📋' },
  ],
  DENTIST: [
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Gelişler', path: ROUTES.VISITS, icon: '🪪' },
    { label: 'Tedavi Planları', path: ROUTES.TREATMENT, icon: '📋' },
  ],
  BANKO: [
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Gelişler', path: ROUTES.VISITS, icon: '🪪' },
    { label: 'Faturalar', path: ROUTES.INVOICES, icon: '💳' },
  ],
};

export const Sidebar: React.FC<{ user: any }> = ({ user }) => {
  const { logout } = useAppStore();
  const navigate = useNavigate();

  const routes = common[user.role] || common.ADMIN;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-slate-200 min-h-[calc(100vh-60px)]">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CR</span>
          </div>
          <div>
            <span className="font-bold text-xl text-slate-900">CRDent</span>
            <p className="text-xs text-slate-500 mt-1">Diş Kliniği CRM</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {routes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            end={r.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <span className="text-lg">{r.icon}</span>
            {r.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => {
            logout();
            navigate(ROUTES.LOGIN);
          }}
          className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          🚪 Çıkış Yap
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
