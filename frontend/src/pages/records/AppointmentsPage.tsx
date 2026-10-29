import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAppStore } from '../../store/appStore';
import {
  Badge,
  Button,
  Card,
  Empty,
  Field,
  Input,
  LoadingText,
  Modal,
  PageHeader,
  Select,
  StatCard,
  Table,
  Textarea,
} from '../../components/ui';
import {
  APPT_STATUS_LABEL,
  APPT_TYPE_LABEL,
  ROLE_LABEL,
  SOURCES,
  VISIT_STATUS_LABEL,
  apiError,
  dateTime,
  fromLocalInput,
  isToday,
  statusTone,
  toLocalInput,
} from '../../lib/format';

const emptyForm = {
  target: 'patient' as 'patient' | 'lead',
  patientId: '',
  leadId: '',
  type: 'MEETING',
  userId: '',
  channel: '',
  campaignId: '',
  dateTime: toLocalInput(new Date(Date.now() + 3600000)),
  notes: '',
};

export const AppointmentsPage: React.FC = () => {
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [scope, setScope] = useState('');
  const [channel, setChannel] = useState('');
  const [date, setDate] = useState(() => toLocalInput(new Date()));
  const [view, setView] = useState<'list' | 'slots'>('slots');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [reschedule, setReschedule] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const canCreate = ['ADMIN', 'CALL_CENTER', 'SALES', 'BANKO'].includes(user?.role || '');
  const canArrive = ['ADMIN', 'CALL_CENTER', 'SALES', 'BANKO'].includes(user?.role || '');
  const canReschedule = canCreate;

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', { status, type, scope, channel }],
    queryFn: async () => {
      const res = await api.get('/appointments', {
        params: {
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(scope ? { scope } : {}),
          ...(channel ? { channel } : {}),
        },
      });
      return res.data.data as any[];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => (await api.get('/patients')).data.data as any[],
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => (await api.get('/leads')).data.data as any[],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => (await api.get('/users/staff')).data.data as any[],
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => (await api.get('/campaigns')).data.data as any[],
  });

  const staffOptions = useMemo(
    () => staff.filter((s: any) => (form.type === 'MEETING' ? s.role === 'SALES' : s.role === 'DENTIST')),
    [staff, form.type]
  );

  const visibleAppointments = useMemo(() => {
    const base = date ? appointments.filter((a) => String(a.appointmentDate || '').slice(0, 10) === date) : appointments;
    if (scope === 'today') return base.filter((a) => isToday(a.appointmentDate));
    if (scope === 'upcoming') return base.filter((a) => new Date(a.appointmentDate).getTime() > Date.now());
    if (scope === 'past') return base.filter((a) => new Date(a.appointmentDate).getTime() < Date.now());
    return base;
  }, [appointments, date, scope]);

  const summary = useMemo(() => {
    const todays = visibleAppointments.filter((a) => isToday(a.appointmentDate)).length;
    const pending = visibleAppointments.filter((a) => a.status === 'PENDING').length;
    const leadBookings = visibleAppointments.filter((a) => a.leadId).length;
    return { todays, pending, leadBookings };
  }, [visibleAppointments]);

  const slotColumns = useMemo(() => {
    const source = form.type === 'MEETING' ? staff.filter((s: any) => s.role === 'SALES') : staff.filter((s: any) => s.role === 'DENTIST');
    return source.map((s: any) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      appointments: visibleAppointments.filter((a: any) => (a.user?.id || a.userId) === s.id),
    }));
  }, [staff, form.type, visibleAppointments]);

  const slotSlots = useMemo(() => {
    const times = visibleAppointments
      .map((a: any) => String(a.appointmentDate || '').slice(11, 16))
      .filter((t: string) => /^\d{2}:\d{2}$/.test(t));
    const pool = times.length ? times : ['09:00', '18:00'];
    const toMin = (t: string) => {
      const parts = t.split(':').map(Number);
      return parts[0] * 60 + parts[1];
    };
    const from = toMin(pool[0]);
    const to = toMin(pool[pool.length - 1]);
    const slots: string[] = [];
    for (let m = from; m <= to; m += 15) {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const mm = (m % 60).toString().padStart(2, '0');
      slots.push(`${h}:${mm}`);
    }
    return slots;
  }, [visibleAppointments]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['visits'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['patient'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/appointments', {
        ...(form.target === 'patient' ? { patientId: form.patientId } : { leadId: form.leadId }),
        type: form.type,
        userId: form.userId || null,
        channel: form.channel || undefined,
        campaignId: form.campaignId || undefined,
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

  const arriveMutation = useMutation({
    mutationFn: async (id: string) => (await api.post('/visits', { appointmentId: id })).data.data,
    onSuccess: (visit) => {
      invalidate();
      alert(`Geliş kaydı oluşturuldu. Protokol No: ${visit.protokolNo}`);
    },
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
        subtitle="Görüşme, muayene ve tedavi randevuları; her randevu hasta veya lead ile ilişkilendirilir"
        action={
          canCreate ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => (window.location.href = '/visits')}>
                Geliş Kayıtları
              </Button>
              <Button onClick={() => setCreateOpen(true)}>+ Yeni Randevu</Button>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Listedeki Randevu" value={visibleAppointments.length} />
        <StatCard label="Bugün" value={summary.todays} tone="blue" />
        <StatCard label="Lead Randevusu" value={summary.leadBookings} hint={`${summary.pending} onay bekliyor`} tone="violet" />
      </div>
      <Card className="p-4 flex flex-wrap gap-3">

        <div className="flex items-center gap-2">
          <Button size="sm" variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>
            Liste
          </Button>
          <Button size="sm" variant={view === 'slots' ? 'primary' : 'secondary'} onClick={() => setView('slots')}>
            Takvim
          </Button>
        </div>

        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-[170px]" />

        <Select value={scope} onChange={(e) => setScope(e.target.value)} className="max-w-[170px]">
          <option value="">Tüm Zamanlar</option>
          <option value="today">Bugün</option>
          <option value="upcoming">Yaklaşan</option>
          <option value="past">Geçmiş</option>
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="max-w-[170px]">
          <option value="">Tüm Türler</option>
          {Object.entries(APPT_TYPE_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[170px]">
          <option value="">Tüm Durumlar</option>
          {Object.entries(APPT_STATUS_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <Select value={channel} onChange={(e) => setChannel(e.target.value)} className="max-w-[170px]">
          <option value="">Tüm Kanallar</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="Bilinmiyor">Bilinmiyor</option>
        </Select>
      </Card>

      <Card>
        {isLoading ? (
          <LoadingText />
        ) : view === 'slots' ? (
          <Table
            head={['Saat', ...slotColumns.map((c: any) => `${c.name} - ${ROLE_LABEL[c.role] || c.role}`)]}
          >
            {slotSlots.map((slot) => (
              <tr key={slot}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{slot}</td>
                {slotColumns.map((c: any) => {
                  const appt = c.appointments.find((a: any) => String(a.appointmentDate || '').slice(11, 16) === slot);
                  if (!appt) {
                    return (
                      <td key={c.id} className="px-4 py-3 border-t border-slate-100 text-slate-400">
                        -
                      </td>
                    );
                  }
                  const tone = appt.type === 'MEETING' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  return (
                    <td key={c.id} className={`px-4 py-3 border-t border-slate-100 ${tone}`}>
                      <p className="font-semibold text-slate-900">
                        {appt.patient?.name || appt.lead?.name || '-'} {appt.patient?.surname || appt.lead?.surname || ''}
                      </p>
                      <p className="text-xs text-slate-600">{appt.channel || 'Bilinmiyor'}</p>
                      <p className="text-xs text-slate-500">{APPT_TYPE_LABEL[appt.type] || appt.type}</p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </Table>
        ) : visibleAppointments.length === 0 ? (
          <Empty title="Randevu bulunamadı" hint="Filtreleri seçin veya yeni randevu oluşturun." />
        ) : (
          <Table
            head={[
              'Randevu No',
              'Hasta / Lead',
              'Tarih',
              'Tür',
              'Kanal',
              'Personel',
              'Randevuyu Veren',
              'Durum',
              'Geliş',
              'İşlem',
            ]}
          >
            {visibleAppointments.map((a: any) => {
              const person = a.patient || a.lead;
              return (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{a.randevuNo}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">
                      {person?.name} {person?.surname || ''}
                    </p>
                    <p className="text-xs text-slate-400">
                      {a.patient ? a.patient.hastaNo : 'Lead · hasta kaydı yok'} · {person?.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{dateTime(a.appointmentDate)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(a.type)}>{APPT_TYPE_LABEL[a.type]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">{a.channel || 'Bilinmiyor'}</p>
                    <p className="text-xs text-slate-400">{a.campaign?.name || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.user?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">{a.createdBy?.name || '-'}</p>
                    <p className="text-xs text-slate-400">{a.createdBy ? ROLE_LABEL[a.createdBy.role] : ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={a.status}
                      onChange={(e) => statusMutation.mutate({ id: a.id, status: e.target.value })}
                      className="text-xs py-1 max-w-[140px]"
                    >
                      {Object.entries(APPT_STATUS_LABEL).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    {a.visit ? (
                      <div>
                        <p className="font-mono text-xs text-slate-600">{a.visit.protokolNo}</p>
                        <Badge tone={statusTone(a.visit.status)}>{VISIT_STATUS_LABEL[a.visit.status]}</Badge>
                      </div>
                    ) : a.status === 'CANCELLED' || a.status === 'NO_SHOW' ? (
                      <span className="text-xs text-slate-400">-</span>
                    ) : canArrive ? (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => arriveMutation.mutate(a.id)}
                        disabled={arriveMutation.isPending}
                      >
                        Geliş Al
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">Bekliyor</span>
                    )}
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
              );
            })}
          </Table>
        )}
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni Randevu"
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Vazgeç
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                (form.target === 'patient' ? !form.patientId : !form.leadId) || createMutation.isPending
              }
            >
              {createMutation.isPending ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, target: 'patient', patientId: '', leadId: '' })}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
              form.target === 'patient'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-300 text-slate-600'
            }`}
          >
            Kayıtlı Hasta
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, target: 'lead', patientId: '', leadId: '' })}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
              form.target === 'lead'
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-slate-300 text-slate-600'
            }`}
          >
            Lead (Hasta Kaydı Yok)
          </button>
        </div>

        {form.target === 'patient' ? (
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
        ) : (
          <Field label="Lead *" hint="Lead hasta kaydına dönüşmeden randevu verilebilir.">
            <Select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })}>
              <option value="">Lead seçin</option>
              {leads.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.phone} · {l.source}
                  {l.patient ? ' (hastaya dönüştü)' : ''}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Randevu Türü *">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, userId: '' })}>
              {Object.entries(APPT_TYPE_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Personel"
            hint={form.type === 'MEETING' ? 'Görüşmeler satış personeli tarafından yapılır.' : 'Muayene/tedavi doktor tarafından yapılır.'}
          >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Kanal" hint="Boş bırakılırsa lead/hasta kaynağından otomatik belirlenir.">
            <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option value="">Otomatik</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Kampanya">
            <Select value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })}>
              <option value="">Kampanyasız / Otomatik</option>
              {campaigns.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
        <p className="text-xs text-slate-400">
          Randevu numarası otomatik oluşturulur. Randevuyu veren kişi olarak siz kaydedilirsiniz.
        </p>
      </Modal>

      <Modal
        open={!!reschedule}
        onClose={() => setReschedule(null)}
        title={`Randevuyu Ertele - ${reschedule?.patient?.name || reschedule?.lead?.name || ''}`}
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
