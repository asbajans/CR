export type UserRole = 'ADMIN' | 'DENTIST' | 'CALL_CENTER' | 'SALES' | 'BANKO';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Patient = {
  id: string;
  hastaNo: string;
  name: string;
  surname: string;
  tc: string;
  phone: string;
  email?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  address?: string | null;
  createdAt: string;
};

export type AppointmentType = 'CONSULTATION' | 'TREATMENT';
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type Appointment = {
  id: string;
  randevuNo: string;
  patientId: string;
  patient?: Patient;
  userId?: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  appointmentDate: string;
  createdAt: string;
  notes?: string | null;
};

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CLINIC_VISIT'
  | 'TREATMENT_APPROVED'
  | 'APPOINTMENT_BOOKED'
  | 'SOLD';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  source: string;
  campaignId?: string | null;
  status: LeadStatus;
  patientId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  createdAt: string;
};

export type TreatmentPlanStatus = 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export type TreatmentItem = {
  id: string;
  toothNo?: string | null;
  treatment: string;
  price: number;
  quantity: number;
  stepOrder: number;
};

export type TreatmentPlan = {
  id: string;
  patientId: string;
  patient?: Patient;
  status: TreatmentPlanStatus;
  totalPrice: number;
  discount: number;
  paymentPlan?: any;
  items: TreatmentItem[];
  invoices: any[];
  createdAt: string;
};

export type Invoice = {
  id: string;
  planId: string;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate?: string | null;
  paidAt?: string | null;
};
