import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { LoadingText, PageHeader, StatCard } from '../../components/ui';
import { money } from '../../lib/format';
import { UsersPage } from '../records/UsersPage';

export const Admin: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data.data as any,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yönetici Paneli"
        subtitle="Klinik özeti, kullanıcı yönetimi ve kampanya ayarları"
      />

      {!data ? (
        <LoadingText />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Toplam Hasta" value={data.totalPatients} />
          <StatCard label="Bugünkü Randevu" value={data.todaysAppointments} tone="blue" />
          <StatCard label="Bu Ay Tahsilat" value={money(data.monthlyRevenue)} tone="green" />
          <StatCard label="Kalan Bakiye" value={money(data.outstanding)} tone="amber" />
        </div>
      )}

      <UsersPage />
    </div>
  );
};
