import React from 'react';
import { useAppStore } from '../../store/appStore';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES, ROLE_LABELS } from '../../lib/constants';

type NavItem = { label: string; path: string; icon: string };

const common: Record<string, NavItem[]> = {
  ADMIN: [
    { label: 'Panelim', path: ROUTES.ADMIN, icon: '🏠' },
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Leadler', path: ROUTES.LEADS, icon: '📞' },
    { label: 'Tedavi Planları', path: ROUTES.TREATMENT, icon: '📋' },
    { label: 'Faturalar', path: ROUTES.INVOICES, icon: '💳' },
  ],
  CALL_CENTER: [
    { label: 'Panelim', path: ROUTES.CALL_CENTER, icon: '🏠' },
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Leadler', path: ROUTES.LEADS, icon: '📞' },
  ],
  SALES: [
    { label: 'Panelim', path: ROUTES.SALES, icon: '🏠' },
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Leadler', path: ROUTES.LEADS, icon: '📞' },
    { label: 'Tedavi Planları', path: ROUTES.TREATMENT, icon: '📋' },
  ],
  DENTIST: [
    { label: 'Panelim', path: ROUTES.DENTIST, icon: '🏠' },
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Tedavi Planları', path: ROUTES.TREATMENT, icon: '📋' },
  ],
  BANKO: [
    { label: 'Panelim', path: ROUTES.BANKO, icon: '🏠' },
    { label: 'Genel Bakış', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Hastalar', path: ROUTES.PATIENTS, icon: '👥' },
    { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
    { label: 'Faturalar', path: ROUTES.INVOICES, icon: '💳' },
  ],
};

export const Sidebar: React.FC<{ user: any }> = ({ user }) => {
  const { logout } = useAppStore();
  const navigate = useNavigate();

  const routes = common[user.role] || common.ADMIN;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-slate-900 text-white min-h-[calc(100vh-57px)]">
      <div className="p-6 border-b border-slate-800">
        <span className="font-bold text-xl text-blue-400">CRDent</span>
        <p className="text-xs text-slate-400 mt-1">{ROLE_LABELS[user.role] || user.role}</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {routes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            end={r.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <span>{r.icon}</span>
            {r.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            logout();
            navigate(ROUTES.LOGIN);
          }}
          className="w-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition"
        >
          🚪 Çıkış Yap
        </button>
      </div>
    </aside>
  );
};
