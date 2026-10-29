import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, Select, Table, Textarea } from '../../components/ui';
import { ROLE_LABEL, dateOnly, dateTime, fromLocalInput, money, toLocalInput } from '../../lib/format';

type Tab = 'expenses' | 'services' | 'commissions';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('expenses');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ayarlar"
        subtitle="Hizmet / ürün yönetimi, masraf takibi ve komisyon oranları"
      />

      <div className="border-b border-slate-200 bg-white rounded-t-xl">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'expenses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Masraflar
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'commissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Komisyonlar
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'services' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Hizmetler / Ürünler
          </button>
        </nav>
      </div>

      <div className="px-6 pb-6">
        {activeTab === 'expenses' ? <ExpensesTab /> : activeTab === 'services' ? <ServicesTab /> : <CommissionsTab />}
      </div>
    </div>
  );
};

const ExpensesTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; id?: string; name: string; description: string }>({
    open: false,
    name: '',
    description: '',
  });
  const [expenseModal, setExpenseModal] = useState<{
    open: boolean;
    id?: string;
    categoryId: string;
    name: string;
    amount: string;
    expenseDate: string;
    description: string;
  }>({
    open: false,
    categoryId: '',
    name: '',
    amount: '',
    expenseDate: toLocalInput(),
    description: '',
  });
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => (await api.get('/settings/expense-categories')).data.data as any[],
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses', categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('categoryId', categoryFilter);
      const { data } = await api.get(`/settings/expenses${params.toString() ? `?${params}` : ''}`);
      return data.data as any[];
    },
  });

  const saveCategory = async () => {
    if (!categoryModal.name.trim()) return;
    if (categoryModal.id) {
      await api.patch(`/settings/expense-categories/${categoryModal.id}`, {
        name: categoryModal.name.trim(),
        description: categoryModal.description.trim() || undefined,
      });
    } else {
      await api.post('/settings/expense-categories', {
        name: categoryModal.name.trim(),
        description: categoryModal.description.trim() || undefined,
      });
    }
    setCategoryModal({ open: false, name: '', description: '' });
    queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Bu masraf kategorisini silmek istediğinizden emin misiniz?')) return;
    await api.delete(`/settings/expense-categories/${id}`);
    queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
  };

  const saveExpense = async () => {
    if (!expenseModal.categoryId || !expenseModal.name.trim()) return;
    const payload = {
      categoryId: expenseModal.categoryId,
      name: expenseModal.name.trim(),
      amount: expenseModal.amount,
      expenseDate: fromLocalInput(expenseModal.expenseDate),
      description: expenseModal.description.trim() || undefined,
    };
    if (expenseModal.id) {
      await api.patch(`/settings/expenses/${expenseModal.id}`, payload);
    } else {
      await api.post('/settings/expenses', payload);
    }
    setExpenseModal({ open: true, categoryId: '', name: '', amount: '', expenseDate: toLocalInput(), description: '' });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Bu masrafı silmek istediğinizden emin misiniz?')) return;
    await api.delete(`/settings/expenses/${id}`);
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  const totalExpenses = (expenses || []).reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Masraf Yönetimi</h2>
        <Button size="sm" onClick={() => setCategoryModal({ open: true, name: '', description: '' })}>
          + Yeni Kategori
        </Button>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Masraf Kategorileri</h3>
          <span className="text-xs text-slate-500">{categories?.length || 0} kategori</span>
        </div>
        <div className="overflow-x-auto">
          <Table head={['Kategori', 'Açıklama', 'İşlemler']}>
            {categories?.map((c: any) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.description || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setCategoryModal({ open: true, id: c.id, name: c.name, description: c.description || '' })}>
                      Düzenle
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteCategory(c.id)}>
                      Sil
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Giderler</h3>
          <div className="flex items-center gap-3">
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-64">
              <option value="">Tüm Kategoriler</option>
              {categories?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Button size="sm" onClick={() => setExpenseModal({ open: true, categoryId: categoryFilter || categories?.[0]?.id || '', name: '', amount: '', expenseDate: toLocalInput(), description: '' })}>
              + Yeni Gider
            </Button>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-600">
            Toplam: <span className="font-bold text-slate-900">{money(totalExpenses)}</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table head={['Tarih', 'Kategori', 'Açıklama', 'Tutar', 'İşlemler']}>
            {expenses?.map((e: any) => (
              <tr key={e.id}>
                <td className="px-4 py-3 text-slate-600">{dateOnly(e.expenseDate)}</td>
                <td className="px-4 py-3 font-medium">{e.category?.name || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{e.description || '-'}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{money(e.amount)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setExpenseModal({ open: true, id: e.id, categoryId: e.categoryId, name: e.name, amount: String(e.amount), expenseDate: e.expenseDate?.slice(0, 16) || toLocalInput(), description: e.description || '' })}>
                      Düzenle
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteExpense(e.id)}>
                      Sil
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <Modal
        open={categoryModal.open}
        onClose={() => setCategoryModal({ open: false, name: '', description: '' })}
        title={categoryModal.id ? 'Kategori Düzenle' : 'Yeni Kategori'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCategoryModal({ open: false, name: '', description: '' })}>
              İptal
            </Button>
            <Button onClick={saveCategory} disabled={!categoryModal.name.trim()}>
              Kaydet
            </Button>
          </>
        }
      >
        <Field label="Kategori Adı">
          <Input value={categoryModal.name} onChange={(e) => setCategoryModal({ ...categoryModal, name: e.target.value })} placeholder="Örn: İlaç, Sınav Masrafı" />
        </Field>
        <Field label="Açıklama">
          <Textarea value={categoryModal.description} onChange={(e) => setCategoryModal({ ...categoryModal, description: e.target.value })} placeholder="Opsiyonel açıklama" />
        </Field>
      </Modal>

      <Modal
        open={expenseModal.open}
        onClose={() => setExpenseModal({ open: false, categoryId: '', name: '', amount: '', expenseDate: toLocalInput(), description: '' })}
        title={expenseModal.id ? 'Gider Düzenle' : 'Yeni Gider'}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setExpenseModal({ open: false, categoryId: '', name: '', amount: '', expenseDate: toLocalInput(), description: '' })}>
              İptal
            </Button>
            <Button onClick={saveExpense} disabled={!expenseModal.categoryId || !expenseModal.name.trim() || !expenseModal.amount}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Kategori">
            <Select value={expenseModal.categoryId} onChange={(e) => setExpenseModal({ ...expenseModal, categoryId: e.target.value })}>
              <option value="">Seçiniz</option>
              {categories?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tutar (₺)">
            <Input type="number" step="0.01" min="0" value={expenseModal.amount} onChange={(e) => setExpenseModal({ ...expenseModal, amount: e.target.value })} />
          </Field>
          <Field label="Gider Tarihi">
            <Input type="datetime-local" value={expenseModal.expenseDate} onChange={(e) => setExpenseModal({ ...expenseModal, expenseDate: e.target.value })} />
          </Field>
          <Field label="Açıklama">
            <Input value={expenseModal.description} onChange={(e) => setExpenseModal({ ...expenseModal, description: e.target.value })} />
          </Field>
        </div>
        <Field label="Gider Adı">
          <Input value={expenseModal.name} onChange={(e) => setExpenseModal({ ...expenseModal, name: e.target.value })} placeholder="Örn: Ziyaret gideri" />
        </Field>
      </Modal>
    </div>
  );
};

const ServicesTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [serviceModal, setServiceModal] = useState<{ open: boolean; id?: string; category: string; name: string; description: string; price: string; isActive: boolean }>({
    open: false,
    category: '',
    name: '',
    description: '',
    price: '',
    isActive: true,
  });

    const { data: services } = useQuery({
      queryKey: ['services'],
      queryFn: async () => (await api.get('/settings/services')).data.data as any[],
    });
  
    const { data: serviceCategories } = useQuery({
      queryKey: ['service-categories'],
      queryFn: async () => (await api.get('/settings/service-categories')).data.data as string[],
    });
  
    const saveService = async () => {
    if (!serviceModal.category.trim() || !serviceModal.name.trim() || !serviceModal.price) return;
    const payload = {
      category: serviceModal.category.trim(),
      name: serviceModal.name.trim(),
      description: serviceModal.description.trim() || undefined,
      price: serviceModal.price,
      isActive: serviceModal.isActive,
    };
    if (serviceModal.id) {
      await api.patch(`/settings/services/${serviceModal.id}`, payload);
    } else {
      await api.post('/settings/services', payload);
    }
    setServiceModal({ open: false, category: '', name: '', description: '', price: '', isActive: true });
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };

  const deleteService = async (id: string) => {
    if (!confirm('Bu hizmeti ürünü silmek istediğinizden emin misiniz?')) return;
    await api.delete(`/settings/services/${id}`);
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };

  const categories = [...new Set((services || []).map((s: any) => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Hizmet / Ürün Yönetimi</h2>
        <Button size="sm" onClick={() => setServiceModal({ open: true, category: '', name: '', description: '', price: '', isActive: true })}>
          + Yeni Hizmet / Ürün
        </Button>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Hizmetler ve Ürünler</h3>
          <p className="text-xs text-slate-500 mt-1">Kategori bazlı hizmet ve ürün fiyatları tanımlanır. Tedavi planlarında seçilebilir.</p>
        </div>
        <div className="p-6 space-y-6">
          {(categories || []).map((cat: any) => {
            const catServices = (services || []).filter((s: any) => s.category === cat);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-800">{cat}</h4>
                  <span className="text-xs text-slate-500">{catServices.length} hizmet</span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <Table head={['Hizmet / Ürün', 'Açıklama', 'Fiyat', 'Durum', 'İşlemler']}>
                    {catServices.map((s: any) => (
                      <tr key={s.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                        <td className="px-4 py-3 text-slate-600">{s.description || '-'}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{money(s.price)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={s.isActive ? 'green' : 'slate'}>{s.isActive ? 'Aktif' : 'Pasif'}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => setServiceModal({ open: true, id: s.id, category: s.category, name: s.name, description: s.description || '', price: String(s.price), isActive: s.isActive })}>
                              Düzenle
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => deleteService(s.id)}>
                              Sil
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Table>
                </div>
              </div>
            );
          })}
          {(!services || services.length === 0) && <Empty title="Henüz hizmet / ürün tanımlı değil" />}
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Kategori Özeti</h3>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {categories?.map((cat: any) => (
              <Badge key={cat} tone="blue">{cat}</Badge>
            ))}
          </div>
        </div>
      </Card>

      <Modal
        open={serviceModal.open}
        onClose={() => setServiceModal({ open: false, category: '', name: '', description: '', price: '', isActive: true })}
        title={serviceModal.id ? 'Hizmet / Ürün Düzenle' : 'Yeni Hizmet / Ürün'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setServiceModal({ open: false, category: '', name: '', description: '', price: '', isActive: true })}>
              İptal
            </Button>
            <Button onClick={saveService} disabled={!serviceModal.category.trim() || !serviceModal.name.trim() || !serviceModal.price}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Kategori *">
              <Select value={serviceModal.category} onChange={(e) => setServiceModal({ ...serviceModal, category: e.target.value })}>
                <option value="">— Seçiniz —</option>
                {(serviceCategories || []).map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
          </Field>
          <Field label="Hizmet / Ürün Adı *">
            <Input value={serviceModal.name} onChange={(e) => setServiceModal({ ...serviceModal, name: e.target.value })} placeholder="Örn: Implant, Ortodonti Tedavisi" />
          </Field>
          <Field label="Fiyat (₺) *">
            <Input type="number" step="0.01" min="0" value={serviceModal.price} onChange={(e) => setServiceModal({ ...serviceModal, price: e.target.value })} />
          </Field>
          <Field label="Açıklama">
            <Input value={serviceModal.description} onChange={(e) => setServiceModal({ ...serviceModal, description: e.target.value })} />
          </Field>
          <Field label="Aktif">
            <Select value={serviceModal.isActive ? 'true' : 'false'} onChange={(e) => setServiceModal({ ...serviceModal, isActive: e.target.value === 'true' })}>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
};

const CommissionsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [rateModal, setRateModal] = useState<{ open: boolean; id?: string; role: string; type: string; serviceCategory: string; rate: string; isActive: boolean }>({
    open: false,
    role: 'DENTIST',
    type: 'doctor',
    serviceCategory: '',
    rate: '20',
    isActive: true,
  });
  const [commissionModal, setCommissionModal] = useState<{
    open: boolean;
    userId: string;
    type: 'doctor' | 'sales' | 'callcenter' | 'banko';
    periodStart: string;
    periodEnd: string;
    totalAmount: string;
    commissionRate: string;
    calculatedAmount: string;
    status: string;
  }>({
    open: false,
    userId: '',
    type: 'doctor',
    periodStart: toLocalInput(),
    periodEnd: toLocalInput(),
    totalAmount: '',
    commissionRate: '0',
    calculatedAmount: '',
    status: 'pending',
  });

  const { data: rates } = useQuery({
    queryKey: ['commission-rates'],
    queryFn: async () => (await api.get('/settings/commission-rates')).data.data as any[],
  });

  const { data: commissions } = useQuery({
    queryKey: ['commissions'],
    queryFn: async () => (await api.get('/settings/commissions')).data.data as any[],
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data.data as any[],
  });

  const saveRate = async () => {
    if (!rateModal.role || !rateModal.type.trim() || !rateModal.rate) return;
    const payload = {
      role: rateModal.role,
      type: rateModal.type,
      serviceCategory: rateModal.serviceCategory || undefined,
      rate: rateModal.rate,
      isActive: rateModal.isActive,
    };
    if (rateModal.id) {
      await api.patch(`/settings/commission-rates/${rateModal.id}`, payload);
    } else {
      await api.post('/settings/commission-rates', payload);
    }
    setRateModal({ open: false, role: 'DENTIST', type: 'doctor', serviceCategory: '', rate: '20', isActive: true });
    queryClient.invalidateQueries({ queryKey: ['commission-rates'] });
  };

  const deleteRate = async (id: string) => {
    if (!confirm('Bu komisyon oranını silmek istediğinizden emin misiniz?')) return;
    await api.delete(`/settings/commission-rates/${id}`);
    queryClient.invalidateQueries({ queryKey: ['commission-rates'] });
  };

  const saveCommission = async () => {
    if (!commissionModal.userId || !commissionModal.totalAmount) return;
    const calculatedAmount = (Number(commissionModal.totalAmount) * Number(commissionModal.commissionRate || 0)) / 100;
    const payload = {
      userId: commissionModal.userId,
      type: commissionModal.type,
      periodStart: fromLocalInput(commissionModal.periodStart),
      periodEnd: fromLocalInput(commissionModal.periodEnd),
      totalAmount: commissionModal.totalAmount,
      commissionRate: commissionModal.commissionRate,
      calculatedAmount: String(calculatedAmount.toFixed(2)),
    };
    await api.post('/settings/commissions', payload);
    setCommissionModal({ open: false, userId: '', type: 'doctor', periodStart: toLocalInput(), periodEnd: toLocalInput(), totalAmount: '', commissionRate: '0', calculatedAmount: '', status: 'pending' });
    queryClient.invalidateQueries({ queryKey: ['commissions'] });
  };

  const updateCommissionStatus = async (id: string, status: string) => {
    await api.patch(`/settings/commissions/${id}`, { status });
    queryClient.invalidateQueries({ queryKey: ['commissions'] });
  };

  const totalCommissions = (commissions || []).reduce((sum: number, c: any) => sum + Number(c.calculatedAmount || 0), 0);
  const pendingCount = (commissions || []).filter((c: any) => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Komisyon Yönetimi</h2>
        <Button size="sm" onClick={() => setCommissionModal({ open: true, userId: '', type: 'doctor', periodStart: toLocalInput(), periodEnd: toLocalInput(), totalAmount: '', commissionRate: '20', calculatedAmount: '', status: 'pending' })}>
          + Yeni Komisyon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Toplam Komisyon</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{money(totalCommissions)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Bekleyen İşlem</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{pendingCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Oranlı Komisyonlar</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{rates?.length || 0}</p>
        </Card>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Komisyon Oranları</h3>
          <Button size="sm" onClick={() => setRateModal({ open: true, role: 'DENTIST', type: 'doctor', serviceCategory: '', rate: '20', isActive: true })}>
            + Yeni Oran
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table head={['Rol', 'Tip', 'Hizmet / Ürün Kategorisi', 'Oran', 'Durum', 'İşlemler']}>
            {rates?.map((r: any) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{ROLE_LABEL[r.role] || r.role}</td>
                <td className="px-4 py-3 text-slate-600">{r.type}</td>
                <td className="px-4 py-3 text-slate-600">{r.serviceCategory || '-'}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{r.rate}%</td>
                <td className="px-4 py-3">
                  <Badge tone={r.isActive ? 'green' : 'slate'}>{r.isActive ? 'Aktif' : 'Pasif'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setRateModal({ open: true, id: r.id, role: r.role, type: r.type, serviceCategory: r.serviceCategory || '', rate: String(r.rate), isActive: r.isActive })}>
                      Düzenle
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteRate(r.id)}>
                      Sil
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Komisyon Hareketleri</h3>
        </div>
        <div className="overflow-x-auto">
          <Table head={['Tarih', 'Kullanıcı', 'Tip', 'Toplam Tutar', 'Oran', 'Hesaplanan', 'Durum', 'İşlemler']}>
            {commissions?.map((c: any) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-slate-600">{dateTime(c.createdAt)}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{c.user?.name || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{c.type}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{money(c.totalAmount)}</td>
                <td className="px-4 py-3 text-slate-600">{c.commissionRate}%</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{money(c.calculatedAmount)}</td>
                <td className="px-4 py-3">
                  <Badge tone={c.status === 'paid' ? 'green' : c.status === 'calculated' ? 'blue' : 'amber'}>{c.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.status !== 'paid' && (
                      <Button size="sm" variant="success" onClick={() => updateCommissionStatus(c.id, 'paid')}>
                        Öde
                      </Button>
                    )}
                    {c.status === 'pending' && (
                      <Button size="sm" variant="secondary" onClick={() => updateCommissionStatus(c.id, 'calculated')}>
                        Hesapla
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <Modal
        open={rateModal.open}
        onClose={() => setRateModal({ open: false, role: 'DENTIST', type: 'doctor', serviceCategory: '', rate: '20', isActive: true })}
        title={rateModal.id ? 'Komisyon Oranı Düzenle' : 'Yeni Komisyon Oranı'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRateModal({ open: false, role: 'DENTIST', type: 'doctor', serviceCategory: '', rate: '20', isActive: true })}>
              İptal
            </Button>
            <Button onClick={saveRate} disabled={!rateModal.role || !rateModal.type.trim() || !rateModal.rate}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Rol">
            <Select value={rateModal.role} onChange={(e) => setRateModal({ ...rateModal, role: e.target.value })}>
              <option value="ADMIN">Yönetici</option>
              <option value="DENTIST">Doktor</option>
              <option value="CALL_CENTER">Çağrı Merkezi</option>
              <option value="SALES">Satışçı</option>
              <option value="BANKO">Banko</option>
            </Select>
          </Field>
          <Field label="Tip">
            <Input value={rateModal.type} onChange={(e) => setRateModal({ ...rateModal, type: e.target.value })} placeholder="Örn: doctor" />
          </Field>
          <Field label="Hizmet / Ürün Kategorisi">
            <Input value={rateModal.serviceCategory} onChange={(e) => setRateModal({ ...rateModal, serviceCategory: e.target.value })} placeholder="Örn: implant, treatment, surgery, product" />
          </Field>
          <Field label="Oran (%)">
            <Input type="number" step="0.01" min="0" value={rateModal.rate} onChange={(e) => setRateModal({ ...rateModal, rate: e.target.value })} />
          </Field>
          <Field label="Aktif">
            <Select value={rateModal.isActive ? 'true' : 'false'} onChange={(e) => setRateModal({ ...rateModal, isActive: e.target.value === 'true' })}>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={commissionModal.open}
        onClose={() => setCommissionModal({ open: false, userId: '', type: 'doctor', periodStart: toLocalInput(), periodEnd: toLocalInput(), totalAmount: '', commissionRate: '20', calculatedAmount: '', status: 'pending' })}
        title="Yeni Komisyon"
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setCommissionModal({ open: false, userId: '', type: 'doctor', periodStart: toLocalInput(), periodEnd: toLocalInput(), totalAmount: '', commissionRate: '20', calculatedAmount: '', status: 'pending' })}>
              İptal
            </Button>
            <Button onClick={saveCommission} disabled={!commissionModal.userId || !commissionModal.totalAmount}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Kullanıcı">
            <Select value={commissionModal.userId} onChange={(e) => setCommissionModal({ ...commissionModal, userId: e.target.value })}>
              <option value="">Seçiniz</option>
              {usersQuery.data?.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({ROLE_LABEL[u.role] || u.role})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tip">
            <Select value={commissionModal.type} onChange={(e) => setCommissionModal({ ...commissionModal, type: e.target.value as any })}>
              <option value="doctor">Doktor</option>
              <option value="sales">Satışçı</option>
              <option value="callcenter">Çağrı Merkezi</option>
              <option value="banko">Banko</option>
            </Select>
          </Field>
          <Field label="Başlangıç Tarihi">
            <Input type="datetime-local" value={commissionModal.periodStart} onChange={(e) => setCommissionModal({ ...commissionModal, periodStart: e.target.value })} />
          </Field>
          <Field label="Bitiş Tarihi">
            <Input type="datetime-local" value={commissionModal.periodEnd} onChange={(e) => setCommissionModal({ ...commissionModal, periodEnd: e.target.value })} />
          </Field>
          <Field label="Toplam Tutar (₺)">
            <Input type="number" step="0.01" min="0" value={commissionModal.totalAmount} onChange={(e) => setCommissionModal({ ...commissionModal, totalAmount: e.target.value })} />
          </Field>
          <Field label="Komisyon Oran (%)">
            <Input type="number" step="0.01" min="0" value={commissionModal.commissionRate} onChange={(e) => setCommissionModal({ ...commissionModal, commissionRate: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
