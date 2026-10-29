import React from 'react';

export const Sales: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Satışçı Paneli</h1>
        <p className="text-slate-500">Ön muayene, tedavi planı oluşturma ve lead yönetimi</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Ön Muayene Oluştur</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Tedavi Planı Çıkart</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lead Yönetimi</button>
        </div>
      </div>
    </div>
  );
};
