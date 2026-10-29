import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/constants';

export const Sidebar: React.FC<{ user: any }> = ({ user }) => {
  const { logout } = useAppStore();
  const navigate = useNavigate();

  const roleRoutes: Record<string, { label: string; path: string; icon: string }[]> = {
    CALL_CENTER: [
      { label: 'Görüntüleme Paneli', path: ROUTES.DASHBOARD, icon: '📊' },
      { label: 'Hasta Kayıt', path: ROUTES.PATIENTS, icon: '👤' },
      { label: 'Randevu Oluştur', path: ROUTES.APPOINTMENTS, icon: '📅' },
      { label: 'Lead Girişi', path: ROUTES.LEADS, icon: '📞' },
    ],
    SALES: [
      { label: 'Görüntüleme Paneli', path: ROUTES.DASHBOARD, icon: '📊' },
      { label: 'Ön Muayene / Görüşme', path: ROUTES.APPOINTMENTS, icon: '👨‍⚕️' },
      { label: 'Tedavi Planı', path: ROUTES.TREATMENT, icon: '📋' },
      { label: 'Lead Yönetimi', path: ROUTES.LEADS, icon: '📞' },
    ],
    DENTIST: [
      { label: 'Görüntüleme Paneli', path: ROUTES.DASHBOARD, icon: '📊' },
      { label: 'Hasta Tıbbi Kartı', path: ROUTES.PATIENTS, icon: '📋' },
      { label: 'Tedavi Randevuları', path: ROUTES.APPOINTMENTS, icon: '🦷' },
    ],
    BANKO: [
      { label: 'Görüntüleme Paneli', path: ROUTES.DASHBOARD, icon: '📊' },
      { label: 'Ödeme ve Fatura', path: ROUTES.INVOICES, icon: '💳' },
      { label: 'Tedavi Randevu Onayı', path: ROUTES.APPOINTMENTS, icon: '📅' },
    ],
    ADMIN: [
      { label: 'Görüntüleme Paneli', path: ROUTES.DASHBOARD, icon: '📊' },
      { label: 'Hasta Yönetimi', path: ROUTES.PATIENTS, icon: '👥' },
      { label: 'Randevular', path: ROUTES.APPOINTMENTS, icon: '📅' },
      { label: 'Kampanyalar', path: '/campaigns', icon: '📣' },
      { label: 'Raporlar', path: '/reports', icon: '📈' },
      { label: 'Kullanıcılar', path: '/users', icon: '👤' },
    ],
  };

  const routes = roleRoutes[user.role] || roleRoutes.ADMIN;

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-800">
        <span className="font-bold text-xl text-blue-400">CRDent</span>
        <p className="text-xs text-slate-400 mt-1">{user.role}</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {routes.map((r) => (
          <Link
            key={r.path}
            to={r.path}
            onClick={() => navigate(r.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              window.location.pathname === r.path ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>{r.icon}</span>
            {r.label}
          </Link>
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
