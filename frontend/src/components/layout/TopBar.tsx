import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../lib/api';
import { ROUTES } from '../../lib/constants';
import { useNavigate } from 'react-router-dom';

export const TopBar: React.FC<{ user: any }> = ({ user }) => {
  const { user: storeUser, logout } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('crdent_user');
    const token = localStorage.getItem('crdent_token');
    if (saved && token && !storeUser) {
      try {
        const parsed = JSON.parse(saved);
        storeUser && useAppStore.setState({ user: parsed, token });
      } catch {}
    }
  }, [storeUser]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl text-blue-600">CRDent</span>
          <span className="text-sm text-slate-500 font-medium">Diş Kliniği CRM</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">{user.name}</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
};
