import React from 'react';
import { useAppStore } from '../../store/appStore';

export const Dashboard: React.FC = () => {
  const { user } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Görüntüleme Paneli</h1>
        <p className="text-slate-500">Hoş geldiniz, {user?.name} ({user?.role})</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-500">Toplam Hasta</p>
          <p className="text-2xl font-bold mt-2">-</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-500">Bekleyen Randevu</p>
          <p className="text-2xl font-bold mt-2">-</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-500">Bugünkü Gelir</p>
          <p className="text-2xl font-bold mt-2">-</p>
        </div>
      </div>
    </div>
  );
};
