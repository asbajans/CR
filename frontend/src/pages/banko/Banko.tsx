import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Badge, Card, Empty, LoadingText, PageHeader, StatCard, Table } from '../../components/ui';
import { INVOICE_STATUS_LABEL, dateOnly, money, statusTone } from '../../lib/format';

export const Banko: React.FC = () => {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => (await api.get('/invoices')).data.data as any[],
  });

  const summary = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const paid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    return { total, paid, remaining: total - paid };
  }, [invoices]);

  const openInvoices = invoices.filter((inv) => inv.status !== 'PAID');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banko (Maliye) Paneli"
        subtitle="Fatura, tahsilat ve kalan bakiye takibi"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Toplam Faturalanan" value={money(summary.total)} />
        <StatCard label="Tahsil Edilen" value={money(summary.paid)} tone="green" />
        <StatCard label="Kalan Bakiye" value={money(summary.remaining)} tone="amber" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/invoices" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
          + Fatura / Ödeme İşlemleri
        </Link>
        <Link to="/appointments" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:border-blue-400">
          Randevu Onayları
        </Link>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Açık Faturalar</h2>
        </div>
        {isLoading ? (
          <LoadingText />
        ) : openInvoices.length === 0 ? (
          <Empty title="Açık fatura yok" hint="Tüm faturalar tahsil edilmiş görünüyor." />
        ) : (
          <Table head={['Hasta', 'Fatura', 'Ödenen', 'Kalan', 'Durum', 'Vade']}>
            {openInvoices.map((inv: any) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 font-medium">
                  {inv.plan?.patient?.name} {inv.plan?.patient?.surname}
                </td>
                <td className="px-4 py-3">{money(inv.amount)}</td>
                <td className="px-4 py-3 text-emerald-600">{money(inv.paidAmount)}</td>
                <td className="px-4 py-3 font-semibold">{money(Number(inv.amount) - Number(inv.paidAmount))}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(inv.status)}>{INVOICE_STATUS_LABEL[inv.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">{dateOnly(inv.dueDate)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};
