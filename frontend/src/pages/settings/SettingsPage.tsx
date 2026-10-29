import React, { useState } from 'react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('expenses');

  return (
    <div className="space-y-6">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ayarlar ve Yönetim</h1>
        <p className="text-gray-600">Sistem ayarları, masraf yönetimi ve komisyon takip</p>

        <div className="mt-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'expenses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Masraflar
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'commissions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Komisyonlar
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'expenses' ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Masraf Yönetimi</h2>
              <p className="text-gray-600">Masraf kategorileri, giderler ve harcama izleme burada olacak.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Komisyon Takip</h2>
              <p className="text-gray-600">Komisyon oranları, komisyon hareketleri ve ödeme takibi burada olacak.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};