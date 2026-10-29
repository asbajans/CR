import React from 'react';

export const Admin: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yönetici Paneli</h1>
        <p className="text-slate-500">Tüm raporlar, kullanıcı yönetimi ve sistem ayarları</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Kullanıcı Yönetimi</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Kampanya Onayı</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Sistem Raporları</button>
        </div>
      </div>
    </div>
  );
};
