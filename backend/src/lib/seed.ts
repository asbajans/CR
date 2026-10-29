import bcrypt from 'bcryptjs';
import {
  AppointmentStatus,
  AppointmentType,
  InvoiceStatus,
  LeadStatus,
  Prisma,
  TreatmentPlanStatus,
  UserRole,
} from '@prisma/client';
import { prisma } from './prisma';

const DEMO_PASSWORD = '123456';

const istanbulDate = (offsetDays: number, hour: number, minute = 0) => {
  const base = new Date(Date.now() + offsetDays * 86400000);
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(base);
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return new Date(`${dateStr}T${hh}:${mm}:00+03:00`);
};

const currentYear = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date()).slice(0, 4);

const usersSeed = [
  { name: 'Ayşe Yılmaz', email: 'admin@crdent.com', role: UserRole.ADMIN },
  { name: 'Dr. Mehmet Kaya', email: 'doktor@crdent.com', role: UserRole.DENTIST },
  { name: 'Dr. Elif Demir', email: 'doktor2@crdent.com', role: UserRole.DENTIST },
  { name: 'Zeynep Şahin', email: 'cagri@crdent.com', role: UserRole.CALL_CENTER },
  { name: 'Burak Aydın', email: 'satis@crdent.com', role: UserRole.SALES },
  { name: 'Fatma Çelik', email: 'banko@crdent.com', role: UserRole.BANKO },
];

const patientSeed = [
  { name: 'Ahmet', surname: 'Yıldız', tc: '10000000001', phone: '0532 111 22 01', email: 'ahmet.yildiz@example.com', birthDate: '1985-03-12', gender: 'Erkek', address: 'Kadıköy, İstanbul' },
  { name: 'Elif', surname: 'Kaya', tc: '10000000002', phone: '0532 111 22 02', email: 'elif.kaya@example.com', birthDate: '1992-07-23', gender: 'Kadın', address: 'Beşiktaş, İstanbul' },
  { name: 'Mustafa', surname: 'Demir', tc: '10000000003', phone: '0532 111 22 03', email: 'mustafa.demir@example.com', birthDate: '1978-11-05', gender: 'Erkek', address: 'Üsküdar, İstanbul' },
  { name: 'Zeynep', surname: 'Çelik', tc: '10000000004', phone: '0532 111 22 04', email: 'zeynep.celik@example.com', birthDate: '1990-01-30', gender: 'Kadın', address: 'Ataşehir, İstanbul' },
  { name: 'Mehmet', surname: 'Öztürk', tc: '10000000005', phone: '0532 111 22 05', email: 'mehmet.ozturk@example.com', birthDate: '1965-09-18', gender: 'Erkek', address: 'Maltepe, İstanbul' },
  { name: 'Ayşe', surname: 'Arslan', tc: '10000000006', phone: '0532 111 22 06', email: 'ayse.arslan@example.com', birthDate: '1988-04-02', gender: 'Kadın', address: 'Bakırköy, İstanbul' },
  { name: 'Emre', surname: 'Koç', tc: '10000000007', phone: '0532 111 22 07', email: 'emre.koc@example.com', birthDate: '1995-12-11', gender: 'Erkek', address: 'Şişli, İstanbul' },
  { name: 'Fatma', surname: 'Şahin', tc: '10000000008', phone: '0532 111 22 08', email: 'fatma.sahin@example.com', birthDate: '1972-06-25', gender: 'Kadın', address: 'Pendik, İstanbul' },
  { name: 'Hüseyin', surname: 'Aydın', tc: '10000000009', phone: '0532 111 22 09', email: 'huseyin.aydin@example.com', birthDate: '1983-08-14', gender: 'Erkek', address: 'Kartal, İstanbul' },
  { name: 'Merve', surname: 'Doğan', tc: '10000000010', phone: '0532 111 22 10', email: 'merve.dogan@example.com', birthDate: '1998-02-19', gender: 'Kadın', address: 'Beyoğlu, İstanbul' },
  { name: 'Ali', surname: 'Kurt', tc: '10000000011', phone: '0532 111 22 11', email: 'ali.kurt@example.com', birthDate: '1970-10-08', gender: 'Erkek', address: 'Sancaktepe, İstanbul' },
  { name: 'Selin', surname: 'Yılmaz', tc: '10000000012', phone: '0532 111 22 12', email: 'selin.yilmaz@example.com', birthDate: '1993-05-27', gender: 'Kadın', address: 'Beylikdüzü, İstanbul' },
  { name: 'Oğuzhan', surname: 'Aksoy', tc: '10000000013', phone: '0532 111 22 13', email: 'oguzhan.aksoy@example.com', birthDate: '1991-09-09', gender: 'Erkek', address: 'Ümraniye, İstanbul' },
  { name: 'Derya', surname: 'Polat', tc: '10000000014', phone: '0532 111 22 14', email: 'derya.polat@example.com', birthDate: '1987-12-01', gender: 'Kadın', address: 'Tuzla, İstanbul' },
];

const medicalSeed: Record<number, { allergies?: string; chronicDiseases?: string; medications?: string; notes?: string }> = {
  0: { allergies: 'Penisilin', chronicDiseases: 'Yok', medications: 'Yok', notes: 'İmplant öncesi kemik grefti değerlendirilecek.' },
  2: { allergies: 'Yok', chronicDiseases: 'Tip 2 Diyabet', medications: 'Metformin 1000mg', notes: 'Cerrahi işlem öncesi HbA1c kontrolü istendi.' },
  4: { allergies: 'Lateks', chronicDiseases: 'Hipertansiyon', medications: 'Ramipril 5mg', notes: 'Tansiyon takibi yapılmalı.' },
  5: { allergies: 'Yok', chronicDiseases: 'Yok', medications: 'Yok', notes: 'Diş beyazlatma sonrası hassasiyet normaldir.' },
  7: { allergies: 'Kodein', chronicDiseases: 'Astım', medications: 'Ventolin', notes: 'Ağrı kesici olarak NSAID tercih edilmemeli.' },
  9: { allergies: 'Yok', chronicDiseases: 'Yok', medications: 'Yok', notes: 'Ortodonti konsültasyonu planlandı.' },
};

const campaignSeed = [
  { name: 'Instagram - Gülüş Tasarımı', channel: 'Instagram', budget: 15000 },
  { name: 'Google Ads - İmplant', channel: 'Google', budget: 25000 },
  { name: 'WhatsApp - Kontrol Randevusu', channel: 'WhatsApp', budget: 5000 },
  { name: 'Referans Programı', channel: 'Referans', budget: 3000 },
];

type PlanSeed = {
  patient: number;
  status: TreatmentPlanStatus;
  discount: number;
  paymentPlan?: Record<string, unknown>;  items: { toothNo?: string; treatment: string; price: number; quantity: number; stepOrder: number }[];
};

const planSeed: PlanSeed[] = [
  {
    patient: 0,
    status: TreatmentPlanStatus.APPROVED,
    discount: 500,
    paymentPlan: { installments: 3, note: '3 taksit' },
    items: [
      { toothNo: '36', treatment: 'İmplant', price: 15000, quantity: 1, stepOrder: 1 },
      { toothNo: '36', treatment: 'Zirkonyum Kaplama', price: 4500, quantity: 1, stepOrder: 2 },
    ],
  },
  {
    patient: 1,
    status: TreatmentPlanStatus.APPROVED,
    discount: 0,
    items: [
      { toothNo: '46', treatment: 'Kanal Tedavisi', price: 3000, quantity: 1, stepOrder: 1 },
      { toothNo: '46', treatment: 'Dolgu', price: 1200, quantity: 1, stepOrder: 2 },
    ],
  },
  {
    patient: 2,
    status: TreatmentPlanStatus.IN_PROGRESS,
    discount: 1000,
    paymentPlan: { installments: 6, note: '6 taksit' },
    items: [
      { toothNo: '14', treatment: 'İmplant', price: 15000, quantity: 1, stepOrder: 1 },
      { toothNo: '15', treatment: 'İmplant', price: 15000, quantity: 1, stepOrder: 2 },
    ],
  },
  {
    patient: 3,
    status: TreatmentPlanStatus.IN_PROGRESS,
    discount: 0,
    items: [
      { treatment: 'Zirkonyum Kaplama', price: 4500, quantity: 4, stepOrder: 1 },
    ],
  },
  {
    patient: 4,
    status: TreatmentPlanStatus.COMPLETED,
    discount: 0,
    items: [
      { toothNo: '26', treatment: 'İmplant', price: 15000, quantity: 1, stepOrder: 1 },
      { toothNo: '26', treatment: 'Zirkonyum Kaplama', price: 4500, quantity: 1, stepOrder: 2 },
    ],
  },
  {
    patient: 5,
    status: TreatmentPlanStatus.COMPLETED,
    discount: 0,
    items: [
      { treatment: 'Diş Taşı Temizliği', price: 800, quantity: 1, stepOrder: 1 },
      { treatment: 'Beyazlatma', price: 3500, quantity: 1, stepOrder: 2 },
    ],
  },
  {
    patient: 6,
    status: TreatmentPlanStatus.DRAFT,
    discount: 0,
    items: [{ treatment: 'Ortodonti', price: 25000, quantity: 1, stepOrder: 1 }],
  },
  {
    patient: 7,
    status: TreatmentPlanStatus.DRAFT,
    discount: 0,
    items: [{ toothNo: '37', treatment: 'İmplant', price: 15000, quantity: 1, stepOrder: 1 }],
  },
];

const invoiceSeed = [
  { plan: 0, amount: 19000, paidAmount: 9000, status: InvoiceStatus.PARTIAL, dueOffset: 15, paidOffset: null as number | null },
  { plan: 1, amount: 4200, paidAmount: 4200, status: InvoiceStatus.PAID, dueOffset: -5, paidOffset: -5 },
  { plan: 2, amount: 29000, paidAmount: 10000, status: InvoiceStatus.PARTIAL, dueOffset: 20, paidOffset: null },
  { plan: 3, amount: 18000, paidAmount: 0, status: InvoiceStatus.UNPAID, dueOffset: 10, paidOffset: null },
  { plan: 4, amount: 19500, paidAmount: 19500, status: InvoiceStatus.PAID, dueOffset: -10, paidOffset: -10 },
  { plan: 5, amount: 4300, paidAmount: 4300, status: InvoiceStatus.PAID, dueOffset: -3, paidOffset: -3 },
];

const leadSeed = [
  { name: 'Ahmet Yıldız', phone: '0532 111 22 01', source: 'Instagram', status: LeadStatus.SOLD, patient: 0, campaign: 0 },
  { name: 'Elif Kaya', phone: '0532 111 22 02', source: 'Google', status: LeadStatus.SOLD, patient: 1, campaign: 1 },
  { name: 'Mustafa Demir', phone: '0532 111 22 03', source: 'Referans', status: LeadStatus.APPOINTMENT_BOOKED, patient: 2, campaign: 3 },
  { name: 'Zeynep Çelik', phone: '0532 111 22 04', source: 'Instagram', status: LeadStatus.CLINIC_VISIT, patient: 3, campaign: 0 },
  { name: 'Hakan Er', phone: '0533 444 55 01', source: 'Google', status: LeadStatus.TREATMENT_APPROVED, patient: 4, campaign: 1 },
  { name: 'Mert Yavuz', phone: '0533 444 55 02', source: 'WhatsApp', status: LeadStatus.NEW, patient: null, campaign: 2 },
  { name: 'Aylin Şen', phone: '0533 444 55 03', source: 'Instagram', status: LeadStatus.CONTACTED, patient: null, campaign: 0 },
  { name: 'Kerem Özkan', phone: '0533 444 55 04', source: 'Google', status: LeadStatus.CONTACTED, patient: null, campaign: 1 },
  { name: 'Deniz Ak', phone: '0533 444 55 05', source: 'Web', status: LeadStatus.NEW, patient: null, campaign: null },
  { name: 'Gizem Nur', phone: '0533 444 55 06', source: 'WhatsApp', status: LeadStatus.NEW, patient: null, campaign: 2 },
];

async function seedUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const map: Record<string, string> = {};
  for (const u of usersSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: { name: u.name, email: u.email, password: passwordHash, role: u.role },
    });
    map[u.email] = user.id;
  }
  console.log('[seed] demo kullanıcıları hazır');
  return map;
}

export async function seedDatabase() {
  const userIds = await seedUsers();

  const patientCount = await prisma.patient.count();
  if (patientCount > 0) {
    console.log(`[seed] veritabanında ${patientCount} hasta var, demo veri eklenmedi`);
    return;
  }

  const year = currentYear();
  const salesId = userIds['satis@crdent.com'];
  const dentist1 = userIds['doktor@crdent.com'];
  const dentist2 = userIds['doktor2@crdent.com'];

  const campaignIds: string[] = [];
  for (const c of campaignSeed) {
    const campaign = await prisma.campaign.create({
      data: { name: c.name, channel: c.channel, budget: c.budget },
    });
    campaignIds.push(campaign.id);
  }

  const patientIds: string[] = [];
  for (let i = 0; i < patientSeed.length; i++) {
    const p = patientSeed[i];
    const patient = await prisma.patient.create({
      data: {
        hastaNo: `H-${year}-${String(i + 1).padStart(4, '0')}`,
        name: p.name,
        surname: p.surname,
        tc: p.tc,
        phone: p.phone,
        email: p.email,
        birthDate: new Date(`${p.birthDate}T00:00:00+03:00`),
        gender: p.gender,
        address: p.address,
        medicalRecord: medicalSeed[i]
          ? {
              create: {
                allergies: medicalSeed[i].allergies,
                chronicDiseases: medicalSeed[i].chronicDiseases,
                medications: medicalSeed[i].medications,
                notes: medicalSeed[i].notes,
              },
            }
          : undefined,
      },
    });
    patientIds.push(patient.id);
  }
  console.log(`[seed] ${patientIds.length} demo hasta oluşturuldu`);

  const planIds: string[] = [];
  for (const plan of planSeed) {
    const total = plan.items.reduce((sum, item) => sum + item.price * item.quantity, 0) - plan.discount;
    const created = await prisma.treatmentPlan.create({
      data: {
        patientId: patientIds[plan.patient],
        status: plan.status,
        totalPrice: total,
        discount: plan.discount,
        paymentPlan: (plan.paymentPlan as Prisma.InputJsonValue | undefined) ?? undefined,
        approvedAt: plan.status === TreatmentPlanStatus.DRAFT ? null : istanbulDate(-5, 12),
        items: {
          create: plan.items.map((item) => ({
            toothNo: item.toothNo,
            treatment: item.treatment,
            price: item.price,
            quantity: item.quantity,
            stepOrder: item.stepOrder,
          })),
        },
      },
    });
    planIds.push(created.id);
  }
  console.log(`[seed] ${planIds.length} tedavi planı oluşturuldu`);

  for (const inv of invoiceSeed) {
    await prisma.invoice.create({
      data: {
        planId: planIds[inv.plan],
        amount: inv.amount,
        paidAmount: inv.paidAmount,
        status: inv.status,
        dueDate: istanbulDate(inv.dueOffset, 12),
        paidAt: inv.paidOffset === null ? null : istanbulDate(inv.paidOffset, 12),
      },
    });
  }
  console.log(`[seed] ${invoiceSeed.length} fatura oluşturuldu`);

  type ApptSeed = {
    patient: number;
    user: string;
    type: AppointmentType;
    status: AppointmentStatus;
    date: Date;
    notes: string;
  };
  const apptSeeds: ApptSeed[] = [];

  for (let i = 0; i < patientIds.length; i++) {
    if (i < 10) {
      apptSeeds.push({
        patient: i,
        user: salesId,
        type: AppointmentType.CONSULTATION,
        status: AppointmentStatus.COMPLETED,
        date: istanbulDate(-(24 - i), 10 + (i % 6), 0),
        notes: 'İlk muayene ve tedavi planı görüşmesi',
      });
    } else if (i < 12) {
      apptSeeds.push({
        patient: i,
        user: salesId,
        type: AppointmentType.CONSULTATION,
        status: AppointmentStatus.CONFIRMED,
        date: istanbulDate(0, 10 + (i - 10) * 2, 30),
        notes: 'Ücretsiz ön muayene',
      });
    } else {
      apptSeeds.push({
        patient: i,
        user: salesId,
        type: AppointmentType.CONSULTATION,
        status: AppointmentStatus.PENDING,
        date: istanbulDate(1, 14 + (i - 12) * 2, 0),
        notes: 'Ücretsiz ön muayene',
      });
    }
  }

  const treatmentPatients = [0, 1, 2, 3, 4, 5];
  for (let i = 0; i < treatmentPatients.length; i++) {
    const patientIndex = treatmentPatients[i];
    apptSeeds.push({
      patient: patientIndex,
      user: i % 2 === 0 ? dentist1 : dentist2,
      type: AppointmentType.TREATMENT,
      status: AppointmentStatus.COMPLETED,
      date: istanbulDate(-(7 - i), 11, 0),
      notes: 'Tedavi seansı tamamlandı',
    });
    apptSeeds.push({
      patient: patientIndex,
      user: i % 2 === 0 ? dentist1 : dentist2,
      type: AppointmentType.TREATMENT,
      status: i % 3 === 0 ? AppointmentStatus.PENDING : AppointmentStatus.CONFIRMED,
      date: istanbulDate(i + 1, 9 + i, 30),
      notes: 'Kontrol / tedavi devam seansı',
    });
  }

  for (let i = 0; i < apptSeeds.length; i++) {
    const a = apptSeeds[i];
    await prisma.appointment.create({
      data: {
        randevuNo: `R-${year}-${String(i + 1).padStart(5, '0')}`,
        patientId: patientIds[a.patient],
        userId: a.user,
        type: a.type,
        status: a.status,
        appointmentDate: a.date,
        notes: a.notes,
      },
    });
  }
  console.log(`[seed] ${apptSeeds.length} randevu oluşturuldu`);

  for (const lead of leadSeed) {
    await prisma.lead.create({
      data: {
        name: lead.name,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        campaignId: lead.campaign === null ? null : campaignIds[lead.campaign],
        patientId: lead.patient === null ? null : patientIds[lead.patient],
      },
    });
  }
  console.log(`[seed] ${leadSeed.length} lead oluşturuldu`);

  console.log('[seed] demo veri yükleme tamamlandı');
}
