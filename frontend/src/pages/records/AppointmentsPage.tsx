import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAppStore } from '../../store/appStore';
import { Badge, Button, Card, Empty, Field, Input, LoadingText, Modal, PageHeader, Select, Table, Textarea } from '../../components/ui';
import {
  APPT_STATUS_LABEL,
  APPT_TYPE_LABEL,
  ROLE_LABEL,
  apiError,
  dateTime,
  fromLocalInput,
  statusTone,
  toLocalInput,
} from '../../lib/format';

const emptyForm = {
  patientId: '',
  type: 'CONSULTATION',
  userId: '',
  dateTime: toLocalInput(new Date(Date.now() + 3600000)),
  notes: '',
};

export const AppointmentsPage: React.FC = () => {
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [scope, setScope] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [reschedule, setReschedule] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const canCreate = ['ADMIN', 'CALL_CENTER', 'SALES', 'BANKO'].includes(user?.role || '');
  const canReschedule = ['ADMIN', 'CALL_CENTER', 'SALES', 'BANKO'].includes(user?.role || '');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', { status, type, scope }],
    queryFn: async () => {
      const res = await api.get('/appointments', {
        params: {
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(scope ? { scope } : {}),
        },
      });
      return res.data.data as any[];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => (await api.get('/patients')).data.data as any[],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => (await api.get('/users/staff')).data.data as any[],
  });

  const staffOptions = useMemo(
    () => staff.filter((s: any) => (form.type === 'CONSULTATION' ? s.role === 'SALES' : s.role === 'DENTIST')),
    [staff, form.type]
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['patient'] });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/appointments', {
        patientId: form.patientId,
        type: form.type,
        userId: form.userId || null,
        appointmentDate: fromLocalInput(form.dateTime),
        notes: form.notes || undefined,
      });
    },
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      setForm({ ...emptyForm });
    },
    onError: (err) => alert(apiError(err)),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/appointments/${id}/status`, { status });
    },
    onSuccess: invalidate,
    onError: (err) => alert(apiError(err)),
  });

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/appointments/${reschedule.id}`, { appointmentDate: fromLocalInput(rescheduleDate) });
    },
    onSuccess: () => {
      invalidate();
      setReschedule(null);
    },
    onError: (err) => alert(apiError(err)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Randevular"
        subtitle="Ön muayene ve tedavi randevularını yönetin"
        action={canCreate ? <Button onClick={() => setCreateOpen(true)}>+ Yeni Randevu</Button> : undefined}
      />

      <Card className="p-4 flex flex-wrap gap-3">
        <Select value={scope} onChange={(e) => setScope(e.target.value)} className="max-w-[180px]">
          <option value="">Tüm Zamanlar</option>
          <option value="today">Bugün</option>
          <option value="upcoming">Yaklaşan</option>
          <option value="past">Geçmiş</option>
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="max-w-[180px]">
          <option value="">Tüm Türler</option>
          <option value="CONSULTATION">Ön Muayene</option>
          <option value="TREATMENT">Tedavi</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[180px]">
          <option value="">Tüm Durumlar</option>
          {Object.entries(APPT_STATUS_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </Card>

      <Card>
        {isLoading ? (
          <LoadingText />
        ) : appointments.length === 0 ? (
          <Empty title="Randevu bulunamadı" hint="Filtreleri değiştirin veya yeni randevu oluşturun." />
        ) : (
          <Table head={['Randevu No', 'Hasta', 'Tarih', 'Tür', 'Personel', 'Durum', 'İşlem']}>
            {appointments.map((a: any) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{a.randevuNo}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">
                    {a.patient?.name} {a.patient?.surname}
                  </p>
                  <p className="text-xs text-slate-400">{a.patient?.phone}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{dateTime(a.appointmentDate)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(a.type)}>{APPT_TYPE_LABEL[a.type]}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{a.user?.name || '-'}</td>
                <td className="px-4 py-3">
                  <Select
                    value={a.status}
                    onChange={(e) => statusMutation.mutate({ id: a.id, status: e.target.value })}
                    className="text-xs py-1 max-w-[150px]"
                  >
                    {Object.entries(APPT_STATUS_LABEL).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-3 text-right">
                  {canReschedule && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setReschedule(a);
                        setRescheduleDate(toLocalInput(a.appointmentDate));
                      }}
                    >
                      Ertele
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni Randevu"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Vazgeç
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!form.patientId || createMutation.isPending}
            >
              {createMutation.isPending ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Hasta *">
            <Select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Hasta seçin</option>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.hastaNo} - {p.name} {p.surname}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Randevu Türü">
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value, userId: '' })}
              >
                <option value="CONSULTATION">Ön Muayene</option>
                <option value="TREATMENT">Tedavi</option>
              </Select>
            </Field>
            <Field label="Personel">
              <Select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                <option value="">Atanmadı</option>
                {staffOptions.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({ROLE_LABEL[s.role]})
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Tarih ve Saat *">
            <Input
              type="datetime-local"
              value={form.dateTime}
              onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
            />
          </Field>
          <Field label="Not">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <p className="text-xs text-slate-400">Randevu numarası otomatik oluşturulur.</p>
        </div>
      </Modal>

      <Modal
        open={!!reschedule}
        onClose={() => setReschedule(null)}
        title={`Randevuyu Ertele - ${reschedule?.patient?.name || ''} ${reschedule?.patient?.surname || ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReschedule(null)}>
              Vazgeç
            </Button>
            <Button onClick={() => rescheduleMutation.mutate()} disabled={rescheduleMutation.isPending}>
              Güncelle
            </Button>
          </>
        }
      >
        <Field label="Yeni Tarih ve Saat">
          <Input type="datetime-local" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
};
