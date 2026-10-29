export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  CALL_CENTER: '/call-center',
  SALES: '/sales',
  DENTIST: '/dentist',
  BANKO: '/banko',
  ADMIN: '/admin',
  PATIENTS: '/patients',
  APPOINTMENTS: '/appointments',
  LEADS: '/leads',
  TREATMENT: '/treatment',
  INVOICES: '/invoices',
} as const;

export const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN: '/admin',
  DENTIST: '/dentist',
  CALL_CENTER: '/call-center',
  SALES: '/sales',
  BANKO: '/banko',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Yönetici',
  DENTIST: 'Doktor',
  CALL_CENTER: 'Çağrı Merkezi',
  SALES: 'Satışçı',
  BANKO: 'Banko',
};
