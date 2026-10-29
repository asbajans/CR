import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../lib/api';
import { ROLE_HOME } from '../../lib/constants';
import { ROLE_LABEL, apiError } from '../../lib/format';

const schema = z.object({
  email: z.string().email('Geçersiz e-posta'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

const demoAccounts = [
  { label: 'Yönetici', email: 'admin@crdent.com', name: 'Ayşe Yılmaz' },
  { label: 'Doktor', email: 'doktor@crdent.com', name: 'Dr. Mehmet Kaya' },
  { label: 'Doktor 2', email: 'doktor2@crdent.com', name: 'Dr. Elif Demir' },
  { label: 'Çağrı Merkezi', email: 'cagri@crdent.com', name: 'Zeynep Şahin' },
  { label: 'Sağlık Danışmanı', email: 'satis@crdent.com', name: 'Burak Aydın' },
  { label: 'Banko', email: 'banko@crdent.com', name: 'Fatma Çelik' },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', data);
      const { user, token } = res.data.data;
      localStorage.setItem('crdent_token', token);
      localStorage.setItem('crdent_user', JSON.stringify(user));
      setUser(user, token);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col justify-center">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-blue-600">CRDent</h1>
            <p className="text-sm text-slate-500 mt-1">Diş Kliniği CRM Giriş</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="admin@crdent.com"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-400">CRDent v1.0.0 · Diş Kliniği Modüler CRM</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-bold text-slate-800">Demo Hesaplar</h2>
          <p className="text-xs text-slate-500 mt-1">
            Her rolün ekranını görmek için bir hesaba tıklayın. Ortak şifre: <strong>123456</strong>
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setValue('email', acc.email);
                  setValue('password', '123456');
                }}
                className="text-left px-3 py-2 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {ROLE_LABEL[acc.label] || acc.label} · {acc.name}
                </p>
                <p className="text-xs text-slate-500">{acc.email}</p>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-600 mb-1">Demo veri</p>
            <p>
              14 hasta, ön muayene ve tedavi randevuları, leadler, tedavi planları ve faturalar otomatik
              oluşturulmuştur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
